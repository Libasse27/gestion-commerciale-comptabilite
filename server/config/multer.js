// ==============================================================================
//                  Configuration du Middleware Multer
//
// Ce module configure et exporte deux stratégies Multer distinctes :
//
// 1. uploadToDisk:
//    - Stocke les fichiers directement sur le disque du serveur.
//    - Idéal pour un environnement de développement local simple et rapide.
//
// 2. uploadToMemory:
//    - Stocke les fichiers temporairement dans la mémoire vive (RAM) sous forme de Buffer.
//    - C'est la méthode requise pour envoyer ensuite le fichier vers un service
//      cloud comme Cloudinary, AWS S3, etc., sans jamais l'écrire sur le disque.
//    - C'est la méthode recommandée pour la production.
//
// ==============================================================================

const multer = require('multer');
const path = require('path');
const fs = require('fs');

// --- Configuration Commune ---

// Chemin où les fichiers seront stockés localement (pour uploadToDisk)
const UPLOAD_DIRECTORY = process.env.UPLOAD_PATH || './uploads';

// S'assurer que le dossier d'upload existe
if (!fs.existsSync(UPLOAD_DIRECTORY)) {
  fs.mkdirSync(UPLOAD_DIRECTORY, { recursive: true });
}

/**
 * Filtre les fichiers pour n'accepter que certains types MIME.
 * Cela ajoute une couche de sécurité en empêchant l'upload de fichiers potentiellement dangereux.
 */
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = [
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    // Documents
    'application/pdf',
    'application/msword', // .doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
    'application/vnd.ms-excel', // .xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'text/csv',
  ];

  if (allowedMimeTypes.includes(file.mimetype)) {
    // Accepter le fichier
    cb(null, true);
  } else {
    // Rejeter le fichier en créant une erreur que le middleware de gestion d'erreurs pourra attraper.
    cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'Type de fichier non supporté.'), false);
  }
};

const limits = {
  // Limite la taille des fichiers. La valeur doit être en bytes.
  fileSize: parseInt(process.env.MAX_FILE_SIZE) || 1024 * 1024 * 10, // 10MB par défaut
};


// --- Stratégie 1: Stockage sur le Disque (Développement) ---
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRECTORY);
  },
  filename: (req, file, cb) => {
    const fieldName = file.fieldname;
    const timestamp = Date.now();
    const extension = path.extname(file.originalname);
    cb(null, `${fieldName}-${timestamp}${extension}`);
  },
});

const uploadToDisk = multer({
  storage: diskStorage,
  limits: limits,
  fileFilter: fileFilter,
});


// --- Stratégie 2: Stockage en Mémoire (Production / Cloud) ---
const memoryStorage = multer.memoryStorage();

const uploadToMemory = multer({
  storage: memoryStorage,
  limits: limits,
  fileFilter: fileFilter,
});


// --- Exportation des deux stratégies ---
module.exports = {
  uploadToDisk,
  uploadToMemory,
};