'use strict';
// ==============================================================================
//        MODULE DE CONNEXION À LA BASE DE DONNÉES MONGODB (AVEC MONGOOSE)
//
// Fournit :
// - Connexion robuste à MongoDB
// - Gestion des erreurs et des événements
// - Arrêt propre (graceful shutdown)
// - Journalisation centralisée via Winston
// ==============================================================================

const mongoose = require('mongoose');
const { logger } = require('../middleware/logger');

// --- Options de connexion Mongoose ---
const connectionOptions = {
  maxPoolSize: 15, // Limite le nombre de connexions simultanées
  serverSelectionTimeoutMS: 10000, // Timeout si le serveur ne répond pas
  socketTimeoutMS: 60000, // Timeout sur les sockets inactifs
  family: 4, // IPv4 uniquement pour éviter les erreurs DNS
};

/**
 * Établit une connexion à MongoDB.
 */
const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    logger.error('❌ ERREUR CRITIQUE : La variable d\'environnement MONGODB_URI est manquante.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true); // Évite les requêtes ambiguës
    logger.info('📡 Tentative de connexion à MongoDB...');
    await mongoose.connect(dbUri, connectionOptions);
  } catch (err) {
    logger.error(`❌ Échec initial de connexion à MongoDB : ${err.message}`, { error: err });
    process.exit(1);
  }
};

// --- Événements de la connexion Mongoose ---
mongoose.connection.on('connected', () => {
  const db = mongoose.connection;
  logger.info('====================================================');
  logger.info('✅ Connexion MongoDB établie avec succès');
  logger.info(`   🔸 Hôte      : ${db.host}`);
  logger.info(`   🔸 Port      : ${db.port}`);
  logger.info(`   🔸 Base      : ${db.name}`);
  logger.info('====================================================');
});

mongoose.connection.on('error', (err) => {
  logger.error('⚠️ Erreur de connexion MongoDB après connexion initiale', {
    message: err.message,
    stack: err.stack,
  });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ Déconnexion détectée : MongoDB déconnecté.');
});

mongoose.connection.on('reconnected', () => {
  logger.info('🔁 Reconnexion à MongoDB réussie.');
});

/**
 * Ferme proprement la connexion MongoDB.
 */
const disconnectDB = async () => {
  logger.info('🔌 Fermeture de la connexion MongoDB...');
  try {
    await mongoose.connection.close();
    logger.info('✅ Connexion MongoDB fermée correctement.');
  } catch (err) {
    logger.error('❌ Erreur lors de la fermeture de la connexion MongoDB', { error: err });
  }
};

module.exports = {
  connectDB,
  disconnectDB,
};
