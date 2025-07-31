// ==============================================================================
//        MODULE DE CONNEXION À LA BASE DE DONNÉES MONGODB (AVEC MONGOOSE)
//
// Ce module assure une connexion robuste à MongoDB, avec gestion des erreurs,
// arrêt propre et messages de logs explicites.
// ==============================================================================

const mongoose = require('mongoose');

// Options de connexion Mongoose
const connectionOptions = {
  maxPoolSize: 15,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 60000,
  family: 4,
};

/**
 * Connexion à la base de données MongoDB avec journalisation et gestion d’erreur.
 */
const connectDB = async () => {
  const dbUri = process.env.MONGODB_URI;

  if (!dbUri) {
    console.error('❌ ERREUR CRITIQUE: La variable MONGODB_URI est absente.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    console.log('⏳ Connexion à MongoDB en cours...');
    await mongoose.connect(dbUri, connectionOptions);
  } catch (err) {
    console.error('🔥 Échec de la connexion initiale à MongoDB:', err.message);
    process.exit(1);
  }
};

// Événements Mongoose pour logs
mongoose.connection.on('connected', () => {
  const db = mongoose.connection;
  console.log('====================================================');
  console.log('✅ MONGODB CONNECTÉ');
  console.log(`   - Hôte      : ${db.host}`);
  console.log(`   - Port      : ${db.port}`);
  console.log(`   - Database  : ${db.name}`);
  console.log('====================================================');
});

mongoose.connection.on('error', (err) => {
  console.error('❗️ ERREUR MONGODB:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('🔌 Déconnexion de MongoDB détectée.');
});

// Fermeture propre
const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🛑 Connexion MongoDB fermée proprement.');
  } catch (err) {
    console.error('❗️ Erreur lors de la fermeture MongoDB:', err);
  }
};

// Arrêt propre sur signal
process.on('SIGINT', async () => {
  console.log('📴 SIGINT détecté : fermeture MongoDB...');
  await disconnectDB();
  process.exit(0);
});

// Gestion des erreurs non interceptées
process.on('unhandledRejection', (reason, promise) => {
  console.error('🚨 PROMESSE NON INTERCEPTÉE:', reason);
  // On pourrait ici envoyer une alerte ou loguer sur un service externe
  disconnectDB().then(() => process.exit(1));
});

module.exports = { connectDB, disconnectDB };
