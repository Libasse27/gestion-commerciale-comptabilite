// server/config/multer.js
// ==============================================================================
//                  CONFIGURATION DU MIDDLEWARE D'UPLOAD (MULTER)
//
// Ce module configure deux stratégies pour gérer les uploads de fichiers :
//
// 1. uploadToDisk:
//    - Stocke les fichiers sur le disque du serveur.
//    - Idéal pour le développement local.
//
// 2. uploadToMemory:
//    - Stocke les fichiers en RAM (Buffer).
//    - Nécessaire pour traiter les fichiers avant de les envoyer à un service
//      cloud (Cloudinary, S3, etc.). Recommandé pour la production.
// ==============================================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { logger } = require('../middleware/logger');
const AppError = require('../utils/appError');

// --- Configuration Commune ---

const UPLOAD_DIRECTORY = process.env.UPLOAD_PATH || './uploads';

// S'assure que le dossier d'upload existe
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
  try {
    fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
    logger.info(`Dossier d'upload créé à l'emplacement : ${UPLOAD_DIRECTORY}`);
  } catch (error) {
    logger.error(`Impossible de créer le dossier d'upload : ${error.message}`);
  }
}

/**
 * Filtre les fichiers par type MIME pour la sécurité.
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Type de fichier non supporté. Formats acceptés : images, PDF, Word, Excel, CSV.', 400), false);
  }
};

const limits = {
  fileSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 10 * 1024 * 1024, // 10MB par défaut
};


// --- Stratégie 1: Stockage sur le Disque (pour le développement) ---
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRECTORY);
  },
  filename: (req, file, cb) => {
    const fieldName = file.fieldname.replace(/[^a-zA-Z0-9]/g, '_');
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${fieldName}-${timestamp}${extension}`);
  },
});

const uploadToDisk = multer({
  storage: diskStorage,
  limits,
  fileFilter,
});


// --- Stratégie 2: Stockage en Mémoire (pour la production / cloud) ---
const memoryStorage = multer.memoryStorage();

const uploadToMemory = multer({
  storage: memoryStorage,
  limits,
  fileFilter,
});


module.exports = {
  uploadToDisk,
  uploadToMemory,
};