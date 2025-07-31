// ==============================================================================
//        POINT D'ENTRÉE PRINCIPAL DU SERVEUR
//
// Ce fichier orchestre le démarrage du serveur, la connexion à la BDD,
// l'initialisation de Socket.IO, les tâches planifiées (cron jobs),
// et la gestion des erreurs critiques ou arrêts système.
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

// --- 3. Fonctions utilitaires ---

/**
 * Gère les événements critiques et assure un arrêt propre du serveur.
 * @param {http.Server} serverInstance
 */
function setupProcessEventListeners(serverInstance) {
  // Promesses non gérées
  process.on('unhandledRejection', async (err) => {
    logger.error('💥 Rejet de promesse non géré', { error: err });
    await shutdown(serverInstance, 1);
  });

  // Exceptions non interceptées
  process.on('uncaughtException', async (err) => {
    logger.error('💥 Exception non interceptée', { error: err });
    await shutdown(serverInstance, 1);
  });

  // Interruption système (ex: Ctrl+C)
  process.on('SIGINT', async () => {
    logger.warn('⚠️ Signal SIGINT reçu. Fermeture du serveur...');
    await shutdown(serverInstance, 0);
  });
}

/**
 * Ferme proprement le serveur et les connexions.
 * @param {http.Server} serverInstance
 * @param {number} code Code de sortie
 */
async function shutdown(serverInstance, code = 0) {
  try {
    await disconnectDB();
    serverInstance.close(() => {
      logger.info('✅ Serveur arrêté proprement.');
      process.exit(code);
    });
  } catch (err) {
    logger.error('❌ Échec lors de l\'arrêt du serveur', { error: err });
    process.exit(1);
  }
}

// --- 4. Fonction principale de démarrage ---
async function startServer() {
  try {
    logger.info('====================================================');
    logger.info('🚀 DÉMARRAGE DU SERVEUR');
    logger.info('====================================================');

    // Connexion à la base de données
    await connectDB();

    // Création du serveur HTTP
    const server = http.createServer(app);

    // Initialisation de WebSocket
    initSocket(server);

    // Démarrage du serveur
    const PORT = process.env.PORT || 5000;
    const serverInstance = server.listen(PORT, () => {
      logger.info('✅ SERVEUR EN LIGNE');
      logger.info(`🌐 Environnement : ${process.env.NODE_ENV || 'development'}`);
      logger.info(`🚪 Port          : ${PORT}`);
      logger.info(`🆔 PID           : ${process.pid}`);
      logger.info('====================================================');
    });

    // Écoute des signaux système pour arrêt propre
    setupProcessEventListeners(serverInstance);

    // Lancement des tâches planifiées
    initializeCronJobs();

  } catch (error) {
    logger.error('❌ Échec critique du démarrage du serveur', { error });
    process.exit(1);
  }
}

// --- 5. Lancement ---
startServer();
