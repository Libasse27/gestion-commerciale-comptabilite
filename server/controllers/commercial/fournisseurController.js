// ==============================================================================
//           Contrôleur pour la Gestion des Fournisseurs (CRUD)
//
// Ce contrôleur gère les requêtes HTTP pour les opérations CRUD sur les
// entités Fournisseur. Il interagit avec le modèle Mongoose `Fournisseur`.
// ==============================================================================

const Fournisseur = require('../../models/commercial/Fournisseur');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Créer un nouveau fournisseur
 * @route   POST /api/v1/fournisseurs
 * @access  Privé (permission: 'create:fournisseur')
 */
exports.createFournisseur = asyncHandler(async (req, res, next) => {
  // Le champ `creePar` est ajouté avec l'ID de l'utilisateur connecté
  const newFournisseur = await Fournisseur.create({
    ...req.body,
    creePar: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      fournisseur: newFournisseur,
    },
  });
});

/**
 * @desc    Récupérer tous les fournisseurs
 * @route   GET /api/v1/fournisseurs
 * @access  Privé (permission: 'read:fournisseur')
 */
exports.getAllFournisseurs = asyncHandler(async (req, res, next) => {
  // TODO: Implémenter la pagination, le filtrage, le tri et la recherche
  const fournisseurs = await Fournisseur.find({}).populate('creePar', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    results: fournisseurs.length,
    data: {
      fournisseurs,
    },
  });
});

/**
 * @desc    Récupérer un fournisseur par son ID
 * @route   GET /api/v1/fournisseurs/:id
 * @access  Privé (permission: 'read:fournisseur')
 */
exports.getFournisseurById = asyncHandler(async (req, res, next) => {
  const fournisseur = await Fournisseur.findById(req.params.id);

  if (!fournisseur) {
    return next(new AppError('Aucun fournisseur trouvé avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      fournisseur,
    },
  });
});

/**
 * @desc    Mettre à jour un fournisseur
 * @route   PATCH /api/v1/fournisseurs/:id
 * @access  Privé (permission: 'update:fournisseur')
 */
exports.updateFournisseur = asyncHandler(async (req, res, next) => {
  const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!fournisseur) {
    return next(new AppError('Aucun fournisseur trouvé avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      fournisseur,
    },
  });
});

/**
 * @desc    Supprimer un fournisseur
 * @route   DELETE /api/v1/fournisseurs/:id
 * @access  Privé (permission: 'delete:fournisseur')
 */
exports.deleteFournisseur = asyncHandler(async (req, res, next) => {
  const fournisseur = await Fournisseur.findByIdAndDelete(req.params.id);

  if (!fournisseur) {
    return next(new AppError('Aucun fournisseur trouvé avec cet identifiant.', 404));
  }
  
  // TODO: Ajouter une logique de "soft delete" (passer isActive à false)
  // si le fournisseur est lié à des factures d'achat.

  res.status(204).json({
    status: 'success',
    data: null,
  });
});