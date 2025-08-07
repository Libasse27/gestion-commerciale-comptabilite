// server/controllers/comptabilite/compteDeResultatController.js
// ==============================================================================
//           Contrôleur pour le Compte de Résultat
//
// Gère la requête HTTP pour la génération du compte de résultat.
// Il délègue toute la logique de calcul au `resultatService`.
// ==============================================================================

const resultatService = require('../../services/comptabilite/resultatService');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');

/**
 * @desc    Générer le Compte de Résultat pour une période
 * @route   GET /api/v1/comptabilite/rapports/compte-de-resultat
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.genererCompteDeResultat = asyncHandler(async (req, res, next) => {
    const { dateDebut, dateFin } = req.query;

    if (!dateDebut || !dateFin) {
        return next(new AppError('Veuillez fournir une date de début et une date de fin.', 400));
    }

    const compteDeResultatData = await resultatService.genererCompteDeResultat({ dateDebut, dateFin });
    
    res.status(200).json({
        status: 'success',
        data: {
            compteDeResultat: compteDeResultatData,
        }
    });
});