// ==============================================================================
//           Contrôleur pour la Gestion des Devis (CRUD & Actions)
//
// Ce contrôleur gère les requêtes HTTP pour les opérations sur les devis.
// Il délègue toute la logique métier complexe au `ventesService`.
// ==============================================================================

const Devis = require('../../models/commercial/Devis');
const ventesService = require('../../services/commercial/ventesService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Créer un nouveau devis
 * @route   POST /api/v1/devis
 * @access  Privé (permission: 'create:vente')
 */
exports.createDevis = asyncHandler(async (req, res, next) => {
  // On passe le corps de la requête et l'ID de l'utilisateur (depuis le middleware auth)
  // au service qui contient toute la logique de calcul et de validation.
  const nouveauDevis = await ventesService.createDevis(req.body, req.user.id);

  res.status(201).json({
    status: 'success',
    data: {
      devis: nouveauDevis,
    },
  });
});

/**
 * @desc    Récupérer tous les devis
 * @route   GET /api/v1/devis
 * @access  Privé (permission: 'read:vente')
 */
exports.getAllDevis = asyncHandler(async (req, res, next) => {
  // TODO: Implémenter la pagination, le filtrage (par client, par statut), etc.
  const devis = await Devis.find({})
    .populate('client', 'nom')
    .populate('creePar', 'firstName lastName')
    .sort({ dateEmission: -1 });

  res.status(200).json({
    status: 'success',
    results: devis.length,
    data: {
      devis,
    },
  });
});

/**
 * @desc    Récupérer un devis par son ID
 * @route   GET /api/v1/devis/:id
 * @access  Privé (permission: 'read:vente')
 */
exports.getDevisById = asyncHandler(async (req, res, next) => {
  const devis = await Devis.findById(req.params.id)
    .populate('client')
    .populate('creePar', 'firstName lastName')
    .populate('lignes.produit', 'nom reference');

  if (!devis) {
    return next(new AppError('Aucun devis trouvé avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      devis,
    },
  });
});

/**
 * @desc    Mettre à jour un devis
 * @route   PATCH /api/v1/devis/:id
 * @access  Privé (permission: 'update:vente')
 */
exports.updateDevis = asyncHandler(async (req, res, next) => {
  // TODO: La mise à jour d'un devis devrait recalculer les totaux.
  // Idéalement, cette logique serait dans un `ventesService.updateDevis`.
  const devis = await Devis.findById(req.params.id);

  if (!devis) {
    return next(new AppError('Aucun devis trouvé avec cet identifiant.', 404));
  }
  
  if (devis.statut !== 'brouillon') {
      return next(new AppError('Seul un devis en statut "brouillon" peut être modifié.', 400));
  }
  
  // Mettre à jour les champs...
  const updatedDevis = await Devis.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      devis: updatedDevis,
    },
  });
});

/**
 * @desc    Convertir un devis en commande
 * @route   POST /api/v1/devis/:id/convert-to-commande
 * @access  Privé (permission: 'create:vente')
 */
exports.convertToCommande = asyncHandler(async (req, res, next) => {
    const { devisId } = req.params;
    const userId = req.user.id;

    const nouvelleCommande = await ventesService.convertDevisToCommande(devisId, userId);

    res.status(201).json({
        status: 'success',
        message: 'Devis converti en commande avec succès.',
        data: {
            commande: nouvelleCommande
        }
    });
});