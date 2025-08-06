// server/controllers/comptabilite/rapportController.js
// ==============================================================================
//           Contrôleur pour les Rapports Comptables
//
// Ce contrôleur gère les requêtes HTTP pour la génération de rapports
// financiers complexes comme la Balance, le Bilan, et le Compte de Résultat.
//
// Il délègue toute la logique de calcul aux services spécialisés.
// ==============================================================================

const balanceService = require('../../services/comptabilite/balanceService');
const bilanService = require('../../services/comptabilite/bilanService');
// const resultatService = require('../../services/comptabilite/resultatService'); // Futur
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');

/**
 * @desc    Générer une Balance Générale pour une période
 * @route   GET /api/v1/comptabilite/rapports/balance
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.genererBalance = asyncHandler(async (req, res, next) => {
    const { dateDebut, dateFin } = req.query;
    if (!dateDebut || !dateFin) {
        return next(new AppError('Veuillez fournir une date de début et une date de fin.', 400));
    }

    const balanceData = await balanceService.genererBalanceGenerale({ dateDebut, dateFin });
    
    res.status(200).json({
        status: 'success',
        data: balanceData,
    });
});


/**
 * @desc    Générer le Bilan à une date donnée
 * @route   GET /api/v1/comptabilite/rapports/bilan
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.genererBilan = asyncHandler(async (req, res, next) => {
    const { dateFin } = req.query;
    if (!dateFin) {
        return next(new AppError('Veuillez fournir une date de fin pour le bilan.', 400));
    }

    const bilanData = await bilanService.genererBilan(dateFin);

    res.status(200).json({
        status: 'success',
        data: bilanData,
    });
});


/**
 * @desc    Générer le Compte de Résultat pour une période
 * @route   GET /api/v1/comptabilite/rapports/compte-de-resultat
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.genererCompteDeResultat = asyncHandler(async (req, res, next) => {
    // TODO: Implémenter le service `resultatService.js`
    // const { dateDebut, dateFin } = req.query;
    // ...
    res.status(501).json({ status: 'fail', message: 'Cette fonctionnalité n\'est pas encore implémentée.' });
});