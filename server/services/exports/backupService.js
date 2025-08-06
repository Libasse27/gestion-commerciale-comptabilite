// server/services/exports/backupService.js
const { exec } = require('child_process');
const util = require('util');
const path = require('path');
const fs = require('fs/promises');
const Sauvegarde = require('../../models/system/Sauvegarde');
const { logger } = require('../../middleware/logger');

const execPromise = util.promisify(exec);
const BACKUP_PATH = process.env.BACKUP_PATH || path.join(__dirname, '..', '..', 'backups');

async function runDatabaseBackup(type = 'Automatique', userId = null) {
  logger.info(`Démarrage d'une sauvegarde de type '${type}'...`);
  await fs.mkdir(BACKUP_PATH, { recursive: true });
  
  const date = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
  const nomFichier = `backup-${date}.gz`;
  const cheminFichier = path.join(BACKUP_PATH, nomFichier);
  
  const command = `mongodump --uri="${process.env.MONGODB_URI}" --archive="${cheminFichier}" --gzip`;
  
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stderr) logger.warn(`Stderr lors de la sauvegarde ${nomFichier}:`, stderr);
    
    const stats = await fs.stat(cheminFichier);
    
    const sauvegardeLog = await Sauvegarde.create({
      nomFichier, type, statut: 'Réussie',
      taille: stats.size, emplacement: 'local', chemin: cheminFichier,
      initiateur: userId,
    });
    
    logger.info(`Sauvegarde réussie : ${cheminFichier}`);
    return sauvegardeLog;

  } catch (error) {
    logger.error(`Échec de la sauvegarde: ${error.message}`);
    
    await Sauvegarde.create({
      nomFichier, type, statut: 'Échouée',
      chemin: cheminFichier, initiateur: userId,
      messageErreur: error.message,
    });
    
    throw error;
  }
}

async function getBackupHistory(options = {}) {
    const page = parseInt(options.page, 10) || 1;
    const limit = parseInt(options.limit, 10) || 10;

    const query = Sauvegarde.find()
      .populate('initiateur', 'firstName lastName')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();
      
    const totalPromise = Sauvegarde.countDocuments();
    const [backups, total] = await Promise.all([query, totalPromise]);

    return { backups, total, pages: Math.ceil(total / limit), currentPage: page };
}

module.exports = {
  runDatabaseBackup,
  getBackupHistory,
};