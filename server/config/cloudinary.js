// server/config/cloudinary.js
// ==============================================================================
//                  CONFIGURATION DU SERVICE CLOUDINARY
//
// Ce module configure et exporte des fonctions utilitaires pour interagir avec
// le service de gestion d'actifs Cloudinary. Il gère l'upload et la suppression
// de manière asynchrone et sécurisée.
//
// L'utilisation de Cloudinary est une best practice en production pour dissocier
// le stockage des fichiers du serveur d'application.
// ==============================================================================

const { v2: cloudinary } = require('cloudinary');
const streamifier = require('streamifier');
const { logger } = require('../middleware/logger');

// -- Configuration de Cloudinary --
// On vérifie la présence des variables d'environnement critiques.
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true, // Toujours utiliser HTTPS
  });
  logger.info('☁️  Service Cloudinary configuré et prêt.');
} else {
  logger.warn('CONFIG WARN: Les variables d\'environnement Cloudinary ne sont pas toutes définies. L\'upload via Cloudinary sera désactivé.');
}


/**
 * Téléverse un fichier vers Cloudinary à partir d'un buffer mémoire.
 * @param {Buffer} fileBuffer - Le buffer du fichier (fourni par multer.memoryStorage).
 * @param {string} folder - Le nom du dossier de destination dans Cloudinary (ex: 'produits').
 * @returns {Promise<object>} Une promesse qui se résout avec le résultat de l'upload.
 */
const uploadFromBuffer = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    // Si la configuration est absente, on rejette immédiatement.
    if (!cloudinary.config().cloud_name) {
      return reject(new Error('Cloudinary n\'est pas configuré. Vérifiez les variables d\'environnement.'));
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) {
          logger.error('Erreur lors de l\'upload sur Cloudinary', { error: error.message });
          return reject(error);
        }
        resolve(result);
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};


/**
 * Supprime un fichier de Cloudinary en utilisant son public_id.
 * @param {string} publicId - L'ID public du fichier à supprimer.
 * @returns {Promise<object>} Une promesse qui se résout avec le résultat de la suppression.
 */
const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    if (!cloudinary.config().cloud_name) {
      return reject(new Error('Cloudinary n\'est pas configuré.'));
    }

    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        logger.error(`Échec de la suppression du fichier Cloudinary : ${publicId}`, { error: error.message });
        return reject(error);
      }
      logger.info(`Fichier Cloudinary supprimé avec succès : ${publicId}`);
      resolve(result);
    });
  });
};

module.exports = {
  uploadFromBuffer,
  deleteFromCloudinary,
};