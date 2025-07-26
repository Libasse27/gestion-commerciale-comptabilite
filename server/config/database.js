// ==============================================================================
//        MODULE DE CONNEXION À LA BASE DE DONNÉES MONGODB
//
// Ce module gère la connexion à MongoDB en utilisant Mongoose.
// Il est conçu pour être robuste, fournir des logs clairs et gérer les arrêts propres.
// ==============================================================================

const mongoose = require('mongoose');

// Options de connexion Mongoose pour la performance et la résilience
const connectionOptions = {
  maxPoolSize: 15,                 // Limite le nombre de sockets ouverts
  serverSelectionTimeoutMS: 10000, // Délai d'attente pour trouver un serveur disponible
  socketTimeoutMS: 60000,          // Délai d'attente avant l'abandon d'une opération inactive
  family: 4,                       // Utilise l'IPv4 pour la connexion
};

/**
 * Fonction asynchrone pour initialiser la connexion à la base de données MongoDB.
 */
const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    console.error('ERREUR CRITIQUE: La variable d\'environnement MONGODB_URI n\'est pas définie. Arrêt de l\'application.');
    process.exit(1); // Arrête le processus si l'URI de la DB est manquant
  }

  try {
    // Active les requêtes strictes (recommandé par Mongoose v7+)
    mongoose.set('strictQuery', true);
    console.log('Tentative de connexion à MongoDB...');
    await mongoose.connect(dbUri, connectionOptions);
  } catch (error) {
    console.error('Échec de la connexion initiale à MongoDB:', error.message);
    process.exit(1);
  }
};

// --- Gestion des événements de la connexion pour un feedback en temps réel ---

mongoose.connection.on('connected', () => {
  const db = mongoose.connection;
  console.log('====================================================');
  console.log('✅ MONGODB CONNECTÉ AVEC SUCCÈS');
  console.log(`   - Hôte         : ${db.host}`);
  console.log(`   - Port         : ${db.port}`);
  console.log(`   - Base de données: ${db.name}`);
  console.log('====================================================');
});

mongoose.connection.on('error', (err) => {
  console.error('Une erreur de connexion MongoDB est survenue après l\'établissement de la connexion:', err);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB a été déconnecté.');
});

/**
 * Fonction pour fermer proprement la connexion à la base de données MongoDB.
 * Utile pour le "graceful shutdown".
 */
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
  } catch (error) {
    console.error('Erreur lors de la fermeture de la connexion MongoDB', error);
  }
};

// --- Export des fonctions ---
module.exports = { connectDB, disconnectDB };