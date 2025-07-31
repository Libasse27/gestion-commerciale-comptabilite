// ==============================================================================
//           Contrôleur pour la Gestion des Configurations de Numérotation
//
// Ce contrôleur gère les requêtes HTTP pour les opérations CRUD sur les
// configurations de numérotation des documents.
//
// Il permet aux administrateurs de personnaliser les formats des numéros
// de facture, client, etc.
// ==============================================================================

const Numerotation = require('../../models/system/Numerotation');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Récupérer toutes les configurations de numérotation
 * @route   GET /api/v1/system/numerotation
 * @access  Privé (Admin - permission: 'manage:settings')
 */
exports.getAllNumerotations = asyncHandler(async (req, res, next) => {
  const numerotations = await Numerotation.find({}).sort({ typeDocument: 1 });

  res.status(200).json({
    status: 'success',
    results: numerotations.length,
    data: {
      numerotations,
    },
  });
});


/**
 * @desc    Créer une nouvelle configuration de numérotation
 * @route   POST /api/v1/system/numerotation
 * @access  Privé (Admin - permission: 'manage:settings')
 */
exports.createNumerotation = asyncHandler(async (req, res, next) => {
    // Le `typeDocument` doit être unique, une erreur sera levée par Mongoose si doublon.
    const newNumerotation = await Numerotation.create(req.body);
    res.status(201).json({
        status: 'success',
        data: { numerotation: newNumerotation }
    });
});


/**
 * @desc    Récupérer une configuration de numérotation par son ID
 * @route   GET /api/v1/system/numerotation/:id
 * @access  Privé (Admin - permission: 'manage:settings')
 */
exports.getNumerotationById = asyncHandler(async (req, res, next) => {
    const numerotation = await Numerotation.findById(req.params.id);
    if (!numerotation) {
        return next(new AppError('Aucune configuration de numérotation trouvée avec cet ID.', 404));
    }
    res.status(200).json({
        status: 'success',
        data: { numerotation }
    });
});


/**
 * @desc    Mettre à jour une configuration de numérotation
 * @route   PATCH /api/v1/system/numerotation/:id
 * @access  Privé (Admin - permission: 'manage:settings')
 */
exports.updateNumerotation = asyncHandler(async (req, res, next) => {
  // On ne devrait pas pouvoir changer le `typeDocument`
  const { typeDocument, ...updateData } = req.body;

  const numerotation = await Numerotation.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  });

  if (!numerotation) {
    return next(new AppError('Aucune configuration de numérotation trouvée avec cet ID.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      numerotation,
    },
  });
});