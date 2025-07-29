// ==============================================================================
//           Service pour la Gestion des Sauvegardes de la Base de Données
//
// Ce service encapsule la logique de création de sauvegardes de la base de
// données MongoDB en utilisant l'utilitaire en ligne de commande `mongodump`.
//
// Il est conçu pour être appelé par une tâche planifiée (cron job) ou
// manuellement par un administrateur.
//
// Chaque opération de sauvegarde est enregistrée dans le modèle `Sauvegarde`
// pour une traçabilité complète.
// ==============================================================================

const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');
const Sauvegarde = require('../../models/system/Sauvegarde');
const { logger } = require('../../middleware/logger');

// Chemin où les sauvegardes seront stockées localement
const BACKUP_PATH = process.env.BACKUP_PATH || path.join(__dirname, '..', '..', 'backups');


/**
 * Exécute le processus de sauvegarde de la base de données.
 * @param {'Automatique' | 'Manuelle'} type - Le type de sauvegarde.
 * @param {string | null} userId - L'ID de l'utilisateur si la sauvegarde est manuelle.
 */
async function runDatabaseBackup(type = 'Automatique', userId = null) {
  logger.info(`Démarrage d'une sauvegarde de type '${type}'...`);

  // S'assurer que le dossier de backup existe
  if (!fs.existsSync(BACKUP_PATH)) {
    fs.mkdirSync(BACKUP_PATH, { recursive: true });
  }
  
  const date = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const nomFichier = `backup-${date}.gz`;
  const cheminFichier = path.join(BACKUP_PATH, nomFichier);
  
  // Construit la commande mongodump
  // --uri: spécifie la base de données à sauvegarder
  // --archive: écrit la sortie dans un fichier unique
  // --gzip: compresse le fichier de sortie
  const command = `mongodump --uri="${process.env.MONGODB_URI}" --archive="${cheminFichier}" --gzip`;
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      const errorMessage = `Échec de la sauvegarde: ${error.message}. Stderr: ${stderr}`;
      logger.error(errorMessage);
      
      // Enregistrer l'échec dans la base de données
      Sauvegarde.create({
        nomFichier,
        type,
        statut: 'Échouée',
        chemin: cheminFichier,
        initiateur: userId,
        messageErreur: error.message,
      }).catch(dbError => logger.error("Impossible d'enregistrer l'échec de la sauvegarde dans la DB.", { error: dbError }));
      
      return;
    }

    // Si la commande réussit
    logger.info(`Sauvegarde réussie ! Fichier créé : ${cheminFichier}`);
    
    // Récupérer la taille du fichier
    const stats = fs.statSync(cheminFichier);
    const fileSizeInBytes = stats.size;

    // Enregistrer le succès dans la base de données
    Sauvegarde.create({
      nomFichier,
      type,
      statut: 'Réussie',
      taille: fileSizeInBytes,
      emplacement: 'local',
      chemin: cheminFichier,
      initiateur: userId,
    }).catch(dbError => logger.error("Impossible d'enregistrer le succès de la sauvegarde dans la DB.", { error: dbError }));
  });
}

/**
 * Récupère la liste des sauvegardes enregistrées.
 */
async function getBackupHistory() {
    return await Sauvegarde.find().sort({ createdAt: -1 });
}

module.exports = {
  runDatabaseBackup,
  getBackupHistory,
};