// ==============================================================================
//        POINT D'ENTRÉE PRINCIPAL ET ORCHESTRATEUR DU SERVEUR
//
// Ce fichier est responsable du cycle de vie du serveur :
// 1. Chargement des variables d'environnement.
// 2. Connexion aux services externes (DB, Cache...).
// 3. Création et démarrage du serveur HTTP.
// 4. Initialisation de Socket.IO et des tâches planifiées (Cron Jobs).
// 5. Gestion des arrêts propres (graceful shutdown) et des erreurs critiques.
// ==============================================================================

// --- Chargement des variables d'environnement (DOIT ÊTRE FAIT EN PREMIER) ---
require('dotenv').config();

const http = require('http');
const app = require('./app'); // Importation de l'application Express configurée
const { connectDB, disconnectDB } = require('./config/database');
const { initSocket } = require('./config/socket');
const { logger } = require('./middleware/logger');
const { initializeCronJobs } = require('./jobs/cronJobs'); // Importation de l'initialiseur de cron

/**
 * Gère les arrêts propres en cas d'erreurs critiques ou de signaux système.
 * @param {http.Server} serverInstance L'instance du serveur à fermer.
 */
function setupProcessEventListeners(serverInstance) {
  process.on('unhandledRejection', async (err) => {
    logger.error('ERREUR NON GÉRÉE (PROMESSE)! 💥 Arrêt progressif...', { error: err });
    await disconnectDB();
    serverInstance.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    logger.error('EXCEPTION NON INTERCEPTÉE! 💥 Arrêt immédiat...', { error: err });
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    logger.warn('Signal SIGINT reçu. Démarrage de l\'arrêt propre du serveur...');
    await disconnectDB();
    serverInstance.close(() => {
      logger.info('Serveur arrêté proprement.');
      process.exit(0);
    });
  });
}

/**
 * Fonction principale asynchrone pour démarrer l'application.
 */
async function startServer() {
  try {
    logger.info('====================================================');
    logger.info('🚀 Démarrage du serveur...');
    logger.info('====================================================');

    // --- SÉQUENCE DE DÉMARRAGE ---
    await connectDB(); // Étape 1: Connexion à la base de données
    // Note: la connexion Redis est gérée dans son propre module config/redis.js

    const server = http.createServer(app); // Étape 2: Création du serveur HTTP

    initSocket(server); // Étape 3: Initialisation de Socket.IO

    const PORT = process.env.PORT || 5000;
    const serverInstance = server.listen(PORT, () => { // Étape 4: Démarrage de l'écoute
      logger.info('====================================================');
      logger.info('✅ SERVEUR DÉMARRÉ AVEC SUCCÈS');
      logger.info(`   - Mode       : ${process.env.NODE_ENV || 'development'}`);
      logger.info(`   - Port       : ${PORT}`);
      logger.info(`   - PID        : ${process.pid}`);
      logger.info('====================================================');
    });

    setupProcessEventListeners(serverInstance); // Étape 5: Mise en place des écouteurs pour l'arrêt propre

    initializeCronJobs(); // Étape 6: Initialisation des tâches planifiées

  } catch (error) {
    logger.error('❌ Échec critique lors de la séquence de démarrage du serveur.', { error });
    process.exit(1);
  }
}

// --- Lancement de l'application ---
startServer();