// server/seeds/seed.js
const mongoose = require('mongoose');
const path = require('path');
dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seedPermissionsAndRoles = require('./permissions');
const seedUsers = require('./users');
const seedParametres = require('./parametres');
const seedNumerotations = require('./numerotations');
const seedPlanComptable = require('./planComptable');
const seedExercices = require('./exercices');
const seedJournaux = require('./journaux');
const seedDemoData = require('./demoData');
const seedModesPaiement = require('./modesPaiement');
const seedComptesTresorerie = require('./comptesTresorerie');
const seedComptesClients = require('./comptesClients'); 
const { logger } = require('../middleware/logger');

const runAllSeeders = async () => {
  try {
    logger.info('🚀 Démarrage du processus d\'amorçage...');
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('✅ Connexion à MongoDB réussie.');

    const clean = !process.argv.includes('--no-clean');
    if (clean) {
      logger.info('🧹 Mode "nettoyage" activé.');
    } else {
      logger.warn('⚠️ Mode "sans nettoyage" activé.');
    }

    logger.info('--- Étape 1: Amorçage des configurations (séquentiel) ---');
    await seedParametres(clean);
    await seedNumerotations(clean);
    await seedPlanComptable(clean);
    await seedExercices(clean);
    await seedJournaux(clean);
    await seedModesPaiement(clean);
    await seedComptesTresorerie(clean);
    await seedComptesClients(clean);
    
    logger.info('--- Étape 2: Amorçage des droits et utilisateurs (séquentiel) ---');
    await seedPermissionsAndRoles(); // Ce script gère son propre nettoyage
    await seedUsers(clean);
    
    if (process.argv.includes('--with-demo')) {
      logger.info('--- Étape 3: Amorçage des données de démonstration ---');
      await seedDemoData();
    }

  } catch (error) {
    logger.error('❌ Erreur critique durant l\'amorçage :', error);
    process.exit(1);
  } finally {
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close();
      logger.info('🔌 Connexion à MongoDB fermée.');
    }
  }
};

runAllSeeders().then(() => {
    logger.info('\n🎉 Processus d\'amorçage terminé avec succès !');
    process.exit(0);
});