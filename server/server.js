// ==============================================================================
//        POINT D'ENTRÉE PRINCIPAL DU SERVEUR
//
// Ce fichier orchestre :
// - le démarrage de l'application Express,
// - la connexion aux services externes (MongoDB, Redis),
// - l'initialisation de Socket.IO,
// - l'exécution des tâches planifiées,
// - la gestion des événements système critiques pour un arrêt propre.
// ==============================================================================

// --- 1. Chargement des variables d'environnement ---
require('dotenv').config();

// --- 2. Dépendances ---
const http = require('http');
const app = require('./app');
const { connectDB, disconnectDB } = require('./config/database');
const { initSocket } = require('./config/socket');
const { initializeCronJobs } = require('./jobs/cronJobs');
const { logger } = require('./middleware/logger');
const { connectRedis, redisClient } = require('./config/redis'); // Ajout de Redis

// --- 3. Configuration ---
const PORT = process.env.PORT || 5000;
const ENV = process.env.NODE_ENV || 'development';

// --- 4. Fermeture propre (Graceful Shutdown) ---
async function shutdown(serverInstance, code = 0) {
  logger.info('🛑 Fermeture du serveur en cours...');
  try {
    // Fermer Redis d'abord
    if (redisClient.isOpen) {
      await redisClient.quit();
      logger.info('Connexion Redis fermée.');
    }
    // Puis la base de données
    await disconnectDB();

    // Enfin, le serveur HTTP
    serverInstance.close(() => {
      logger.info('✅ Serveur arrêté proprement.');
      process.exit(code);
    });
  } catch (err) {
    logger.error('❌ Erreur lors de l\'arrêt du serveur', { error: err });
    process.exit(1);
  }
}

// --- 5. Gestion des événements système ---
function setupProcessEventListeners(serverInstance) {
  process.on('unhandledRejection', (reason) => {
    logger.error('💥 Rejet de promesse non géré. L\'application va s\'arrêter.', { reason });
    throw reason;
  });

  process.on('uncaughtException', async (err) => {
    logger.error('💥 Exception non interceptée. Arrêt brutal du serveur...', { error: err });
    await shutdown(serverInstance, 1);
  });

  process.on('SIGTERM', async () => {
    logger.warn('⚠️ Signal SIGTERM reçu. Fermeture propre du serveur...');
    await shutdown(serverInstance, 0);
  });

  process.on('SIGINT', async () => {
    logger.warn('⚠️ Signal SIGINT (Ctrl+C) reçu. Fermeture propre du serveur...');
    await shutdown(serverInstance, 0);
  });
}

// --- 6. Démarrage du serveur ---
async function startServer() {
  logger.info('====================================================');
  logger.info('🚀 Lancement du serveur...');
  logger.info(`🔧 Environnement : ${ENV}`);
  logger.info('====================================================');

  try {
    // Connexion aux services externes
    await connectDB();
    await connectRedis();

    // Création du serveur HTTP
    const server = http.createServer(app);

    // Initialisation de Socket.IO
    initSocket(server);

     // Lancement du serveur
    const serverInstance = server.listen(PORT, () => {
      logger.info('====================================================');
      logger.info('✅ Serveur en ligne !');
      logger.info(`🌍 Port         : ${PORT}`);
      logger.info(`🧬 PID          : ${process.pid}`);
      logger.info('====================================================');
    });

    // Écoute des événements critiques (crash, Ctrl+C...)
    setupProcessEventListeners(serverInstance);

    // Initialisation des tâches planifiées
    initializeCronJobs();

  } catch (error) {
    logger.error('❌ Échec critique du démarrage du serveur', { error });
    process.exit(1);
  }
}

// --- 7. Lancer ---
startServer();