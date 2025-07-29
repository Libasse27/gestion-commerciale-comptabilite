// ==============================================================================
//           Contrôleur pour les Rapports Comptables et Financiers
//
// Ce contrôleur gère les requêtes HTTP pour la génération des états financiers
// essentiels comme la Balance, le Compte de Résultat et le Bilan.
//
// Il délègue toute la logique de calcul complexe aux services spécialisés.
// ==============================================================================

const balanceService = require('../../services/comptabilite/balanceService');
const bilanService = require('../../services/comptabilite/bilanService');
// const resultatService = require('../../services/comptabilite/resultatService'); // Service futur
const fiscalService = require('../../services/comptabilite/fiscalService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Générer la balance comptable générale
 * @route   GET /api/v1/rapports/balance-generale?dateDebut=...&dateFin=...
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


/**
 * @desc    Générer le Bilan à une date donnée
 * @route   GET /api/v1/rapports/bilan?dateFin=...
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getBilan = asyncHandler(async (req, res, next) => {
    const { dateFin } = req.query;
    if (!dateFin) {
        return next(new AppError('Veuillez fournir une date de fin pour le bilan.', 400));
    }

    const bilan = await bilanService.genererBilan(dateFin);

    res.status(200).json({
        status: 'success',
        data: {
            bilan,
        }
    });
});


/**
 * @desc    Générer le Compte de Résultat pour une période
 * @route   GET /api/v1/rapports/compte-resultat?dateDebut=...&dateFin=...
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getCompteDeResultat = asyncHandler(async (req, res, next) => {
    // TODO: Implémenter le `resultatService.genererCompteDeResultat`
    // Cette fonction sera très similaire à la fonction privée `_calculerResultatExercice`
    // que nous avons mise dans `bilanService`.
    
    res.status(200).json({
        status: 'in_progress',
        message: 'Endpoint pour le Compte de Résultat à implémenter.'
    });
});


/**
 * @desc    Préparer la déclaration de TVA pour une période
 * @route   GET /api/v1/rapports/declaration-tva?annee=...&mois=...
 * @access  Privé (permission: 'manage:comptabilite') // Souvent réservé aux comptables
 */
exports.getDeclarationTVA = asyncHandler(async (req, res, next) => {
    const { annee, mois } = req.query;
    if (!annee || !mois) {
        return next(new AppError('Veuillez fournir une année et un mois.', 400));
    }

    const declarationData = await fiscalService.calculerDeclarationTVA({
        annee: parseInt(annee),
        mois: parseInt(mois),
    });

    res.status(200).json({
        status: 'success',
        data: {
            declarationTVA: declarationData,
        }
    });
});