// server/middleware/upload.js
// ==============================================================================
//                Middleware de Gestion des Uploads de Fichiers
//
// Ce fichier agit comme une surcouche au-dessus de la configuration de Multer
// pour fournir une gestion d'erreurs plus robuste et centralisée.
// ==============================================================================

const multer = require('multer');
const { uploadToMemory, uploadToDisk } = require('../config/multer');
const { logger } = require('../middleware/logger');

/**
 * Crée un middleware pour gérer l'upload d'un fichier unique.
 * @param {'memory' | 'disk'} storageType - Le type de stockage à utiliser.
 * @param {string} fieldName - Le nom du champ du formulaire contenant le fichier.
 * @returns {function} Un middleware Express.
 */
function handleSingleUpload(storageType, fieldName) {
  const uploader = (storageType === 'disk' ? uploadToDisk : uploadToMemory).single(fieldName);

  return (req, res, next) => {
    uploader(req, res, (err) => {
      if (err) {
        logger.warn('Erreur d\'upload interceptée', {
          code: err.code,
          message: err.message,
          field: err.field
        });

        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            const maxSizeMb = process.env.MAX_FILE_SIZE / 1024 / 1024;
            return res.status(400).json({ status: 'fail', message: `Le fichier est trop volumineux. La taille maximale est de ${maxSizeMb}Mo.` });
          }
          if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({ status: 'fail', message: `Champ de fichier inattendu: '${err.field}'. Attendu: '${fieldName}'.` });
          }
        }
        // Gère notre erreur custom de fileFilter et les autres erreurs
        return res.status(400).json({ status: 'fail', message: err.message });
      }

      next();
    });
  };
}

/**
 * Crée un middleware pour gérer l'upload de plusieurs fichiers.
 * @param {'memory' | 'disk'} storageType - Le type de stockage à utiliser.
 * @param {string} fieldName - Le nom du champ du formulaire.
 * @param {number} maxCount - Le nombre maximum de fichiers autorisés.
 * @returns {function} Un middleware Express.
 */
function handleMultipleUploads(storageType, fieldName, maxCount = 10) {
    const uploader = (storageType === 'disk' ? uploadToDisk : uploadToMemory).array(fieldName, maxCount);

    return (req, res, next) => {
        uploader(req, res, (err) => {
             if (err) {
                logger.warn('Erreur d\'upload multiple interceptée', { code: err.code, message: err.message });
                if (err instanceof multer.MulterError) {
                    if (err.code === 'LIMIT_FILE_COUNT') {
                        return res.status(400).json({ status: 'fail', message: `Vous ne pouvez téléverser que ${maxCount} fichiers au maximum.` });
                    }
                }
                return res.status(400).json({ status: 'fail', message: err.message });
            }
            next();
        });
    }
}

module.exports = {
  handleSingleUpload,
  handleMultipleUploads,
};