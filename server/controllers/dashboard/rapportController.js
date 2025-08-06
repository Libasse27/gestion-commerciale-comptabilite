// server/controllers/dashboard/rapportController.js
const balanceService = require('../../services/comptabilite/balanceService');
const bilanService = require('../../services/comptabilite/bilanService');
const fiscalService = require('../../services/comptabilite/fiscalService'); // Corrigé le chemin
const Facture = require('../../models/commercial/Facture');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const { roundTo } = require('../../utils/numberUtils');

exports.getRapportVentes = asyncHandler(async (req, res, next) => {
    const { dateDebut, dateFin } = req.query;
    if (!dateDebut || !dateFin) {
        return next(new AppError('Veuillez fournir une période (dateDebut et dateFin).', 400));
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);
    if (isNaN(debut.getTime()) || isNaN(fin.getTime())) {
        return next(new AppError('Format de date invalide.', 400));
    }

    const factures = await Facture.find({
        statut: { $in: ['Payée', 'Partiellement payée', 'En retard', 'Envoyée'] },
        dateEmission: { $gte: debut, $lte: fin }
    }).populate('client', 'nom').sort({ dateEmission: -1 }).lean();

    const totalVentes = factures.reduce((sum, f) => sum + (f.totalTTC || 0), 0);

    res.status(200).json({
        status: 'success',
        data: {
            periode: { dateDebut, dateFin },
            totalVentes: roundTo(totalVentes),
            nombreFactures: factures.length,
            details: factures,
        }
    });
});

exports.getBalanceGenerale = asyncHandler(async (req, res, next) => {
    const { dateDebut, dateFin } = req.query;
    if (!dateDebut || !dateFin) return next(new AppError('Période requise.', 400));
    const balance = await balanceService.genererBalanceGenerale({ dateDebut, dateFin });
    res.status(200).json({ status: 'success', data: { balance } });
});

exports.getBilan = asyncHandler(async (req, res, next) => {
    const { dateFin } = req.query;
    if (!dateFin) return next(new AppError('Date de fin requise.', 400));
    const bilan = await bilanService.genererBilan(dateFin);
    res.status(200).json({ status: 'success', data: { bilan } });
});

exports.getDeclarationTVA = asyncHandler(async (req, res, next) => {
    const { annee, mois } = req.query;
    if (!annee || !mois) return next(new AppError('Année et mois requis.', 400));

    const declarationTVA = await fiscalService.calculerDeclarationTVA({ annee: parseInt(annee), mois: parseInt(mois) });
    res.status(200).json({ status: 'success', data: { declarationTVA } });
});