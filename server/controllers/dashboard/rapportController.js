// ==============================================================================
//           Contrôleur pour les Rapports Analytiques
// ==============================================================================

// --- Import des Services et Modèles ---
const balanceService = require('../../services/comptabilite/balanceService');
const bilanService = require('../../services/comptabilite/bilanService');
const fiscalService = require('../../services/comptabilite/fiscalService');
const Facture = require('../../models/commercial/Facture');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

// --- Fonctions ---

// Rapport des ventes sur une période
const getRapportVentes = asyncHandler(async (req, res, next) => {
    const { dateDebut, dateFin } = req.query;

    if (!dateDebut || !dateFin) {
        return next(new AppError('Veuillez fournir la période complète : dateDebut et dateFin.', 400));
    }

    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    if (isNaN(debut) || isNaN(fin)) {
        return next(new AppError('Les dates fournies sont invalides.', 400));
    }

    const factures = await Facture.find({
        statut: { $in: ['payee', 'partiellement_payee', 'en_retard', 'envoyee'] },
        dateEmission: { $gte: debut, $lte: fin }
    }).populate('client', 'nom').sort({ dateEmission: -1 });

    const totalVentes = factures.reduce((sum, f) => sum + (f.totalTTC || 0), 0);

    res.status(200).json({
        status: 'success',
        data: {
            periode: { dateDebut, dateFin },
            totalVentes,
            nombreFactures: factures.length,
            details: factures,
        }
    });
});

// Génération de la balance générale
const getBalanceGenerale = asyncHandler(async (req, res, next) => {
    const { dateDebut, dateFin } = req.query;

    if (!dateDebut || !dateFin) {
        return next(new AppError('Veuillez fournir une période valide pour la balance générale.', 400));
    }

    const balance = await balanceService.genererBalanceGenerale({ dateDebut, dateFin });

    res.status(200).json({
        status: 'success',
        data: { balance }
    });
});

// Génération du bilan comptable
const getBilan = asyncHandler(async (req, res, next) => {
    const { dateFin } = req.query;

    if (!dateFin) {
        return next(new AppError('Veuillez fournir une date de fin pour le bilan.', 400));
    }

    const bilan = await bilanService.genererBilan(dateFin);

    res.status(200).json({
        status: 'success',
        data: { bilan }
    });
});

// Calcul de la déclaration de TVA
const getDeclarationTVA = asyncHandler(async (req, res, next) => {
    const { annee, mois } = req.query;

    const an = parseInt(annee);
    const m = parseInt(mois);

    if (!an || !m || isNaN(an) || isNaN(m) || m < 1 || m > 12) {
        return next(new AppError('Veuillez fournir une année et un mois valides pour la déclaration TVA.', 400));
    }

    const declarationTVA = await fiscalService.calculerDeclarationTVA({ annee: an, mois: m });

    res.status(200).json({
        status: 'success',
        data: { declarationTVA }
    });
});

// --- Exports ---
module.exports = {
    getRapportVentes,
    getBalanceGenerale,
    getBilan,
    getDeclarationTVA
};
