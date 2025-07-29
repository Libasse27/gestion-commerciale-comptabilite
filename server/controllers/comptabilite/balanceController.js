// ==============================================================================
//           Contrôleur pour la Génération des Balances Comptables
//
// Ce contrôleur est spécialisé dans la gestion des requêtes HTTP pour la
// génération des différentes balances comptables (générale, tiers, etc.).
//
// Il délègue toute la logique de calcul complexe au `balanceService`.
// ==============================================================================

const balanceService = require('../../services/comptabilite/balanceService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Générer la balance comptable générale
 * @route   GET /api/v1/comptabilite/balances/generale?dateDebut=...&dateFin=...
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getBalanceGenerale = asyncHandler(async (req, res, next) => {
  const { dateDebut, dateFin, inclureComptesNonMouvementes } = req.query;

  if (!dateDebut || !dateFin) {
      return next(new AppError('Veuillez fournir une date de début et une date de fin.', 400));
  }

  const balance = await balanceService.genererBalanceGenerale({
    dateDebut,
    dateFin,
    inclureComptesNonMouvementes: inclureComptesNonMouvementes !== 'false',
  });

  res.status(200).json({
    status: 'success',
    data: {
      balance,
    },
  });
});

// TODO: Ajouter une fonction pour la Balance des Tiers (clients/fournisseurs)
// exports.getBalanceTiers = asyncHandler(async (req, res, next) => { ... });

// TODO: Ajouter une fonction pour la Balance Âgée
// exports.getBalanceAgee = asyncHandler(async (req, res, next) => { ... });