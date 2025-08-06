// server/controllers/paiements/relanceController.js
// ==============================================================================
//           Contrôleur pour la Gestion des Relances
//
// Ce contrôleur gère les requêtes pour la consultation de l'historique des
// relances et le déclenchement manuel du processus.
// ==============================================================================

const Relance = require('../../models/paiements/Relance');
const relanceService = require('../../services/commercial/relanceService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

/**
 * @desc    Récupérer tout l'historique des relances
 * @route   GET /api/v1/paiements/relances
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getAllRelances = asyncHandler(async (req, res, next) => {
    const features = new APIFeatures(
        Relance.find()
            .populate('client', 'nom')
            .populate('facture', 'numero totalTTC soldeDu')
            .populate('envoyePar', 'firstName lastName'),
        req.query
    ).filter().sort().paginate();

    const relances = await features.query;

    res.status(200).json({
        status: 'success',
        results: relances.length,
        data: { relances },
    });
});

/**
 * @desc    Récupérer les relances pour une facture spécifique
 * @route   GET /api/v1/paiements/relances/facture/:factureId
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getRelancesByFacture = asyncHandler(async (req, res, next) => {
    const { factureId } = req.params;
    const relances = await Relance.find({ facture: factureId })
        .populate('envoyePar', 'firstName lastName')
        .sort({ createdAt: -1 });

    res.status(200).json({
        status: 'success',
        results: relances.length,
        data: { relances },
    });
});


/**
 * @desc    Déclencher manuellement le job de relances automatiques
 * @route   POST /api/v1/paiements/relances/run-job
 * @access  Privé (permission: 'manage:paiement')
 */
exports.runAutomatedRemindersJob = asyncHandler(async (req, res, next) => {
    // On n'attend pas la fin du job, on le lance en arrière-plan
    relanceService.runAutomatedReminders();

    res.status(202).json({
        status: 'success',
        message: 'Le processus de relances automatiques a été déclenché en arrière-plan.',
    });
});