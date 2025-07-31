// ==============================================================================
//           Contrôleur pour la Gestion des Informations de l'Entreprise
//
// Ce contrôleur gère les requêtes HTTP pour la lecture et la mise à jour
// de l'unique document contenant les informations de l'entreprise.
//
// Il délègue toute la logique (y compris la gestion du cache) au
// `parametrageService`.
// ==============================================================================

const parametrageService = require('../../services/system/parametrageService');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Récupérer les informations de l'entreprise
 * @route   GET /api/v1/system/entreprise
 * @access  Privé (permission: 'read:settings' ou 'read:comptabilite')
 */
exports.getInformationsEntreprise = asyncHandler(async (req, res, next) => {
  // Le service gère la logique de cache
  const entrepriseInfo = await parametrageService.getInformationsEntreprise();

  res.status(200).json({
    status: 'success',
    data: {
      entreprise: entrepriseInfo,
    },
  });
});


/**
 * @desc    Créer ou Mettre à jour les informations de l'entreprise
 * @route   PUT /api/v1/system/entreprise
 * @access  Privé (Admin - permission: 'manage:settings')
 */
exports.updateInformationsEntreprise = asyncHandler(async (req, res, next) => {
  // Le service gère la logique de `upsert` (création si non existant)
  // et l'invalidation du cache.
  const updatedInfo = await parametrageService.updateInformationsEntreprise(
      req.body,
      req.user.id
  );

  res.status(200).json({
    status: 'success',
    message: 'Les informations de l\'entreprise ont été mises à jour avec succès.',
    data: {
      entreprise: updatedInfo,
    },
  });
});