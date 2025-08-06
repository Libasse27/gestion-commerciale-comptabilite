const backupService = require('../../services/exports/backupService');
const asyncHandler = require('../../utils/asyncHandler');
const fs = require('fs'); // Utiliser fs pour vérifier l'existence du fichier
const AppError = require('../../utils/appError');

exports.triggerBackup = asyncHandler(async (req, res, next) => {
  backupService.runDatabaseBackup('Manuelle', req.user.id);
  res.status(202).json({
    status: 'success',
    message: 'La sauvegarde a été initiée et s\'exécutera en arrière-plan.',
  });
});

exports.getBackupHistory = asyncHandler(async (req, res, next) => {
  // Passer les query params au service pour la pagination
  const history = await backupService.getBackupHistory(req.query);
  res.status(200).json({ status: 'success', ...history });
});

exports.downloadBackup = asyncHandler(async (req, res, next) => {
    // 1. Récupérer les informations de la sauvegarde depuis la DB
    const backup = await backupService.getBackupById(req.params.id);

    // 2. Vérifier que la sauvegarde a réussi et que le fichier existe physiquement
    if (backup.statut !== 'Réussie') {
        return next(new AppError('Impossible de télécharger une sauvegarde qui a échoué.', 400));
    }
    if (!fs.existsSync(backup.chemin)) {
        return next(new AppError('Le fichier de sauvegarde n\'existe plus sur le serveur.', 404));
    }

    // 3. Envoyer le fichier au client
    res.download(backup.chemin, backup.nomFichier, (err) => {
        if (err) {
            // Si une erreur se produit pendant le streaming, elle est passée ici
            next(err);
        }
    });
});