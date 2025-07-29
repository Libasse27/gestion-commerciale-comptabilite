// ==============================================================================
//           Contrôleur pour la Gestion des Sauvegardes
//
// Ce contrôleur gère les requêtes HTTP pour les opérations liées aux
// sauvegardes de la base de données. Il permet aux administrateurs de
// déclencher des sauvegardes manuelles et de consulter l'historique.
//
// Il délègue toute la logique technique au `backupService`.
// ==============================================================================

const backupService = require('../../services/exports/backupService');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Déclencher une sauvegarde manuelle de la base de données
 * @route   POST /api/v1/system/backups/trigger
 * @access  Privé (Admin)
 */
exports.triggerBackup = asyncHandler(async (req, res, next) => {
  // On délègue l'exécution de la sauvegarde au service.
  // C'est une opération "fire-and-forget" qui s'exécute en arrière-plan.
  // On passe le type 'Manuelle' et l'ID de l'utilisateur qui a déclenché l'action.
  backupService.runDatabaseBackup('Manuelle', req.user.id);

  // On répond immédiatement avec un statut 202 Accepted pour indiquer
  // que la demande a été acceptée et est en cours de traitement.
  res.status(202).json({
    status: 'success',
    message: 'La sauvegarde a été initiée. Elle s\'exécutera en arrière-plan et sera disponible dans quelques instants.',
  });
});


/**
 * @desc    Récupérer l'historique de toutes les sauvegardes
 * @route   GET /api/v1/system/backups
 * @access  Privé (Admin)
 */
exports.getBackupHistory = asyncHandler(async (req, res, next) => {
  const backups = await backupService.getBackupHistory();

  res.status(200).json({
    status: 'success',
    results: backups.length,
    data: {
      backups,
    },
  });
});


/**
 * @desc    Télécharger un fichier de sauvegarde spécifique
 * @route   GET /api/v1/system/backups/:id/download
 * @access  Privé (Admin)
 */
exports.downloadBackup = asyncHandler(async (req, res, next) => {
    // TODO: Implémenter la logique pour trouver la sauvegarde par ID,
    // vérifier que le fichier existe sur le disque, puis le streamer
    // au client avec les bons en-têtes Content-Type et Content-Disposition.
    
    res.status(501).json({
        status: 'in_progress',
        message: 'Le téléchargement des sauvegardes est en cours de développement.'
    });
});