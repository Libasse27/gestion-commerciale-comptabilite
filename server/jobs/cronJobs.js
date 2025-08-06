// server/jobs/cronJobs.js
// ==============================================================================
//           Planificateur de Tâches Automatisées (Cron Jobs)
//
// Ce fichier initialise et programme toutes les tâches de fond de l'application.
// ==============================================================================

const cron = require('node-cron');
const { logger } = require('../middleware/logger');

// --- Importation des Services à exécuter ---
const relanceService = require('../services/commercial/relanceService');
const backupService = require('../services/exports/backupService');

/**
 * Initialise et démarre toutes les tâches planifiées de l'application.
 */
function initializeCronJobs() {
  logger.info('🕒 Initialisation des tâches planifiées...');

  // --- Tâche 1: Relances Automatiques pour Factures Impayées ---
  // S'exécute tous les jours à 8h00, fuseau horaire de Dakar.
  cron.schedule('0 8 * * *', () => {
    logger.info('CRON: Démarrage de la tâche de relances automatiques...');
    relanceService.runAutomatedReminders();
  }, {
    scheduled: true,
    timezone: "Africa/Dakar"
  });

  // --- Tâche 2: Sauvegarde Automatique de la Base de Données ---
  // S'exécute tous les jours à 2h00 du matin, fuseau horaire de Dakar.
  cron.schedule('0 2 * * *', () => {
    logger.info('CRON: Démarrage de la sauvegarde de la base de données...');
    backupService.runDatabaseBackup('Automatique', null);
  }, {
    scheduled: true,
    timezone: "Africa/Dakar"
  });

  logger.info('✅ Tâches planifiées initialisées.');
}

module.exports = {
  initializeCronJobs,
};