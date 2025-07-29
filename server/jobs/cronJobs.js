// ==============================================================================
//           Planificateur de Tâches Automatisées (Cron Jobs)
//
// Ce fichier initialise et programme toutes les tâches de fond de l'application.
//
// MISE À JOUR : Activation de la tâche de sauvegarde automatique de la base
// de données.
// ==============================================================================

const cron = require('node-cron');
const { logger } = require('../middleware/logger');

// --- Importation des Services à exécuter ---
const relanceService = require('../services/commercial/relanceService');
const backupService = require('../services/exports/backupService');
// const stockAlertService = require('../services/stock/stockAlertService'); // Futur


/**
 * Initialise et démarre toutes les tâches planifiées de l'application.
 */
function initializeCronJobs() {
  logger.info('🕒 Initialisation des tâches planifiées (cron jobs)...');

  // --- Tâche 1: Relances Automatiques pour Factures Impayées ---
  // S'exécute tous les jours à 8h00 du matin.
  cron.schedule('0 8 * * *', () => {
    logger.info('CRON JOB: Démarrage de la tâche de relances automatiques...');
    relanceService.runAutomatedReminders();
  }, {
    scheduled: true,
    timezone: "Africa/Dakar"
  });


  // --- Tâche 2: Sauvegarde Automatique de la Base de Données ---
  // S'exécute tous les jours à 2h00 du matin (heure du serveur).
  cron.schedule('0 2 * * *', () => {
    logger.info('CRON JOB: Démarrage de la sauvegarde automatique de la base de données...');
    // On appelle la fonction du service en spécifiant le type et sans ID utilisateur
    backupService.runDatabaseBackup('Automatique', null);
  }, {
    scheduled: true,
    timezone: "Africa/Dakar"
  });


  // --- Tâche 3: (Future) Vérification des Seuils d'Alerte de Stock ---
  // S'exécute toutes les heures.
  /*
  cron.schedule('0 * * * *', () => {
    logger.info('CRON JOB: Démarrage de la vérification des seuils de stock...');
    // stockAlertService.checkStockLevels();
  });
  */


  logger.info('✅ Tâches planifiées initialisées et en attente.');
}

// Exporte la fonction d'initialisation
module.exports = {
  initializeCronJobs,
};