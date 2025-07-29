// ==============================================================================
//           Contrôleur pour la Gestion des Écritures Comptables
//
// Ce contrôleur gère les requêtes HTTP pour les opérations sur les écritures
// comptables, comme la création manuelle, la validation, et la consultation
// du journal général.
// ==============================================================================

// --- Import des Modèles et Services ---
const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const ecritureService = require('../../services/comptabilite/ecritureService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Créer une nouvelle écriture manuelle
 * @route   POST /api/v1/comptabilite/ecritures
 * @access  Privé (permission: 'manage:comptabilite')
 */
exports.createEcriture = asyncHandler(async (req, res, next) => {
  const nouvelleEcriture = await ecritureService.createEcritureManuelle(req.body, req.user.id);
  res.status(201).json({
    status: 'success',
    data: { ecriture: nouvelleEcriture },
  });
});

/**
 * @desc    Valider une écriture comptable
 * @route   POST /api/v1/comptabilite/ecritures/:id/valider
 * @access  Privé (permission: 'manage:comptabilite')
 */
exports.validerEcriture = asyncHandler(async (req, res, next) => {
    const ecritureValidee = await ecritureService.validerEcriture(req.params.id, req.user.id);
    res.status(200).json({
        status: 'success',
        message: 'Écriture validée avec succès.',
        data: { ecriture: ecritureValidee }
    });
});


/**
 * @desc    Récupérer toutes les écritures (Journal Général)
 * @route   GET /api/v1/comptabilite/ecritures
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getAllEcritures = asyncHandler(async (req, res, next) => {
    // TODO: Ajouter pagination et filtres (par date, par journal, par statut)
    const ecritures = await EcritureComptable.find({})
        .populate('journal', 'code libelle')
        .populate('creePar', 'firstName')
        .sort({ date: -1 });
        
    res.status(200).json({
        status: 'success',
        results: ecritures.length,
        data: { ecritures }
    });
});

/**
 * @desc    Récupérer une écriture par son ID
 * @route   GET /api/v1/comptabilite/ecritures/:id
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getEcritureById = asyncHandler(async (req, res, next) => {
    const ecriture = await EcritureComptable.findById(req.params.id)
        .populate('journal', 'code libelle')
        .populate('creePar', 'firstName lastName')
        .populate('validePar', 'firstName lastName')
        .populate('lignes.compte', 'numero libelle');
        
    if (!ecriture) {
        return next(new AppError('Aucune écriture trouvée avec cet identifiant.', 404));
    }
        
    res.status(200).json({
        status: 'success',
        data: { ecriture }
    });
});

// TODO: Ajouter les fonctions updateEcriture (si statut = Brouillard) et deleteEcriture