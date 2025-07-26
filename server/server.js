// ==============================================================================
//        POINT D'ENTRÉE PRINCIPAL ET ORCHESTRATEUR DU SERVEUR
//
// Ce fichier est responsable du cycle de vie du serveur :
// 1. Chargement des variables d'environnement.
// 2. Connexion à la base de données.
// 3. Création et démarrage du serveur HTTP.
// 4. Gestion des arrêts propres (graceful shutdown) et des erreurs critiques.
// ==============================================================================

// --- Chargement des variables d'environnement (DOIT ÊTRE FAIT EN PREMIER) ---
require('dotenv').config();

const http = require('http');
const app = require('./app'); // Importation de l'application Express configurée
const { connectDB, disconnectDB } = require('./config/database');
// TODO: Importer et initialiser un logger plus avancé comme Winston

/**
 * Gère les arrêts propres en cas d'erreurs critiques ou de signaux système.
 * @param {http.Server} serverInstance L'instance du serveur à fermer.
 */
function setupProcessEventListeners(serverInstance) {
  process.on('unhandledRejection', async (err) => {
    console.error('ERREUR NON GÉRÉE (PROMESSE)! 💥 Arrêt progressif...', err);
    await disconnectDB();
    serverInstance.close(() => process.exit(1));
  });

  process.on('uncaughtException', (err) => {
    console.error('EXCEPTION NON INTERCEPTÉE! 💥 Arrêt immédiat...', err);
    // Pour ce type d'erreur, il n'est pas sûr de continuer, donc on arrête brutalement.
    process.exit(1);
  });

  process.on('SIGINT', async () => {
    console.warn('Signal SIGINT reçu. Démarrage de l\'arrêt propre du serveur...');
    await disconnectDB();
    serverInstance.close(() => {
      console.info('Serveur arrêté proprement.');
      process.exit(0);
    });
  });
}

/**
 * Fonction principale asynchrone pour démarrer l'application.
 */
async function startServer() {
  try {
    console.log('====================================================');
    console.log('🚀 Démarrage du serveur...');
    console.log('====================================================');

    // --- SÉQUENCE DE DÉMARRAGE ---
    await connectDB(); // Étape 1: Connexion à la base de données

    const server = http.createServer(app); // Étape 2: Création du serveur HTTP avec l'app Express

    // TODO: Initialiser Socket.io ici
    // const { init: initSocket } = require('./config/socket');
    // initSocket(server);

    const PORT = process.env.PORT || 5001;
    const serverInstance = server.listen(PORT, () => { // Étape 3: Démarrage de l'écoute
      console.log('====================================================');
      console.log('✅ SERVEUR DÉMARRÉ AVEC SUCCÈS');
      console.log(`   - Mode       : ${process.env.NODE_ENV}`);
      console.log(`   - Port       : ${PORT}`);
      console.log(`   - Origine Client Autorisée : ${process.env.CORS_ORIGIN}`);
      console.log('====================================================');
    });

    setupProcessEventListeners(serverInstance); // Étape 4: Mise en place des écouteurs pour l'arrêt propre

  } catch (error) {
    console.error('❌ Échec critique lors de la séquence de démarrage du serveur.', error);
    process.exit(1);
  }
}

// --- Lancement de l'application ---
startServer();