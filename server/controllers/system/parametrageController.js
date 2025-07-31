// ==============================================================================
//           Contrôleur pour la Gestion des Paramètres du Système
//
// Ce contrôleur gère les requêtes HTTP pour la lecture et la mise à jour
// des paramètres de l'application (généraux et fiscaux).
//
// Il délègue toute la logique (y compris la gestion du cache) au
// `parametrageService`.
// ==============================================================================

const parametrageService = require('../../services/system/parametrageService');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');

/**
 * @desc    Récupérer tous les paramètres (généraux ou fiscaux)
 * @route   GET /api/v1/system/parametres/:type
 * @access  Privé (Admin - permission: 'manage:settings')
 */
exports.getAllParametres = asyncHandler(async (req, res, next) => {
  const { type } = req.params;
  const { groupe } = req.query;

  if (!['general', 'fiscal'].includes(type)) {
      return next(new AppError('Le type de paramètre est invalide. Utilisez "general" ou "fiscal".', 400));
  }

  const parametres = await parametrageService.getAllParametres(type, groupe);

  res.status(200).json({
    status: 'success',
    results: parametres.length,
    data: {
      parametres,
    },
  });
});


/**
 * @desc    Mettre à jour un ou plusieurs paramètres
 * @route   PATCH /api/v1/system/parametres/:type
 * @access  Privé (Admin - permission: 'manage:settings')
 */
exports.updateParametres = asyncHandler(async (req, res, next) => {
    const { type } = req.params;
    const { parametres } = req.body; // Attendre un tableau d'objets [{ cle, valeur }]

    if (!['general', 'fiscal'].includes(type)) {
        return next(new AppError('Le type de paramètre est invalide.', 400));
    }
    if (!parametres || !Array.isArray(parametres)) {
        return next(new AppError('Veuillez fournir un tableau de paramètres à mettre à jour.', 400));
    }
    
    // Utiliser Promise.all pour exécuter les mises à jour en parallèle
    await Promise.all(
        parametres.map(param => 
            parametrageService.setParametre(type, param.cle, param.valeur, req.user.id)
        )
    );

    res.status(200).json({
        status: 'success',
        message: `${parametres.length} paramètre(s) ont été mis à jour avec succès.`,
    });
});