// ==============================================================================
//                  Configuration du Service Cloudinary
//
// Ce module configure et exporte le SDK Cloudinary. Il fournit des fonctions
// utilitaires pour interagir avec le service Cloudinary, notamment pour
// le téléversement (upload) et la suppression d'actifs.
//
// L'utilisation d'un service comme Cloudinary est la meilleure pratique pour
// la production, car elle dissocie le stockage des fichiers de votre serveur
// d'application, améliorant la scalabilité et la sécurité.
// ==============================================================================

const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// -- Configuration de Cloudinary --
// Le SDK est configuré automatiquement en utilisant les variables d'environnement
// CLOUDINARY_URL ou les variables individuelles (cloud_name, api_key, api_secret).
// Nous nous assurons qu'elles sont présentes au démarrage.
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ Erreur: Les variables d\'environnement Cloudinary ne sont pas définies.');
  // Dans un cas réel, vous pourriez vouloir arrêter le serveur si Cloudinary est essentiel.
  // process.exit(1);
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true, // Toujours utiliser HTTPS
});

/**
 * Téléverse un fichier vers Cloudinary à partir d'un buffer en mémoire.
 * @param {Buffer} fileBuffer - Le buffer du fichier à téléverser (fourni par multer.memoryStorage).
 * @param {string} folder - Le nom du dossier de destination dans Cloudinary (ex: 'produits', 'avatars').
 * @returns {Promise<object>} Une promesse qui se résout avec le résultat de l'upload de Cloudinary.
 */
const uploadFromBuffer = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    // Crée un flux d'upload vers Cloudinary
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        // resource_type: "auto" // Laisse Cloudinary deviner le type de ressource
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    // Crée un flux de lecture à partir du buffer et le pipe vers le flux d'upload
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};


/**
 * Supprime un fichier de Cloudinary en utilisant son public_id.
 * @param {string} publicId - L'identifiant public du fichier à supprimer (ex: 'produits/abc123xyz').
 * @returns {Promise<object>} Une promesse qui se résout avec le résultat de la suppression.
 */
const deleteFromCloudinary = (publicId) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        return reject(error);
      }
      resolve(result);
    });
  });
};


module.exports = {
  cloudinary, // Exporte l'instance configurée
  uploadFromBuffer,
  deleteFromCloudinary
};