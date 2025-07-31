// ==============================================================================
//                Middleware de Gestion des Uploads de Fichiers
//
// Ce fichier agit comme une surcouche au-dessus de la configuration de Multer
// pour fournir une gestion d'erreurs plus robuste et centralisée.
//
// Au lieu d'appeler directement `uploadToMemory.single()` dans les routes, on
// utilisera une fonction de ce middleware qui encapsule l'appel et gère
// les erreurs spécifiques à Multer (fichier trop grand, type de fichier non
// supporté, etc.), les traduisant en réponses HTTP claires pour le client.
// ==============================================================================

const multer = require('multer');
// On importe les deux stratégies de notre configuration
const { uploadToMemory, uploadToDisk } = require('../config/multer');

/**
 * Crée un middleware pour gérer l'upload d'un fichier unique.
 * @param {'memory' | 'disk'} storageType - Le type de stockage à utiliser.
 * @param {string} fieldName - Le nom du champ du formulaire contenant le fichier (ex: 'avatar').
 * @returns {function} Un middleware Express.
 */
function handleSingleUpload(storageType, fieldName) {
  // Choisit la bonne instance de Multer en fonction du type de stockage demandé
  const uploader = (storageType === 'disk' ? uploadToDisk : uploadToMemory).single(fieldName);

  return (req, res, next) => {
    uploader(req, res, (err) => {
      // Gère les erreurs spécifiques à Multer
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          // Note: err.limit n'est pas disponible ici, il faut se référer à la config
          return res.status(400).json({
            status: 'fail',
            message: `Le fichier est trop volumineux. La taille maximale autorisée est de ${process.env.MAX_FILE_SIZE / 1024 / 1024}MB.`,
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({ status: 'fail', message: 'Type de fichier non supporté.' });
        }
        // Gérer d'autres erreurs Multer si nécessaire
        return res.status(400).json({ status: 'fail', message: `Erreur d'upload: ${err.message}` });
      } else if (err) {
        // Gère d'autres erreurs non liées à Multer (ex: notre erreur custom de fileFilter)
        return res.status(400).json({
          status: 'fail',
          message: err.message,
        });
      }

      // Si tout s'est bien passé, on passe au prochain middleware
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
function handleMultipleUploads(storageType, fieldName, maxCount) {
    const uploader = (storageType === 'disk' ? uploadToDisk : uploadToMemory).array(fieldName, maxCount);

    return (req, res, next) => {
        uploader(req, res, (err) => {
             if (err instanceof multer.MulterError) {
                if (err.code === 'LIMIT_FILE_SIZE') {
                    return res.status(400).json({ status: 'fail', message: `Un des fichiers est trop volumineux.` });
                }
                if (err.code === 'LIMIT_FILE_COUNT') {
                    return res.status(400).json({ status: 'fail', message: `Vous ne pouvez téléverser que ${maxCount} fichiers au maximum.` });
                }
                return res.status(400).json({ status: 'fail', message: `Erreur d'upload: ${err.message}` });
            } else if (err) {
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