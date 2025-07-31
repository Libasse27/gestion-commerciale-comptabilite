// ==============================================================================
// Contrôleur pour les Statistiques et Rapports Commerciaux
//
// MISE À JOUR : Ce contrôleur est maintenant "mince" et délègue toute la
// logique de calcul au `statistiquesService` pour une meilleure séparation
// des préoccupations.
// ==============================================================================

// --- Import des Services et Utils ---
const statistiquesService = require('../../services/statistiquesService');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');

/**
 * @desc    Récupérer les KPIs principaux pour le tableau de bord commercial
 * @route   (Utilisé par d'autres contrôleurs, pas directement par une route)
 * @note    Cette fonction est conservée pour être appelée par d'autres contrôleurs si besoin,
 *          mais la logique est maintenant dans le service.
 */
exports.getKpisCommerciaux = asyncHandler(async (req, res, next) => {
  // Cette fonction est dépréciée côté route, réponse 501 Not Implemented.
  res.status(501).json({ message: "Cette fonction est dépréciée, utilisez les endpoints de kpiController." });
});

/**
 * @desc    Récupérer les données pour le graphique des ventes sur les 12 derniers mois
 * @route   GET /api/v1/statistiques/ventes-annuelles
 */
exports.getVentesAnnuelles = asyncHandler(async (req, res, next) => {
  const ventesMensuelles = await statistiquesService.getVentesAnnuelles();

  res.status(200).json({
    status: 'success',
    data: {
      ventesMensuelles,
    },
  });
});

/**
 * @desc    Récupérer les KPIs pour un client spécifique
 * @route   GET /api/v1/statistiques/client/:clientId
 */
exports.getKpisForClient = asyncHandler(async (req, res, next) => {
  const { clientId } = req.params;
  const kpis = await statistiquesService.getKpisForClient(clientId);

  res.status(200).json({
    status: 'success',
    data: {
      kpis,
    },
  });
});
