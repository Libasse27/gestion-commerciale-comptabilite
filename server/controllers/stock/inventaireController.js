// ==============================================================================
//           Contrôleur pour la Gestion des Inventaires
//
// Ce contrôleur gère les requêtes HTTP pour le cycle de vie des inventaires.
// Il délègue toute la logique métier au `inventaireService`.
// ==============================================================================

const Inventaire = require('../../models/stock/Inventaire');
const inventaireService = require('../../services/stock/inventaireService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Démarrer un nouvel inventaire pour un dépôt
 * @route   POST /api/v1/stock/inventaires
 * @access  Privé (permission: 'manage:stock')
 */
exports.startInventaire = asyncHandler(async (req, res, next) => {
  const { depotId } = req.body;
  if (!depotId) {
    return next(new AppError('Veuillez fournir un ID de dépôt pour démarrer l\'inventaire.', 400));
  }

  const nouvelInventaire = await inventaireService.startInventaire(depotId, req.user.id);

  res.status(201).json({
    status: 'success',
    data: {
      inventaire: nouvelInventaire,
    },
  });
});


/**
 * @desc    Ajouter ou mettre à jour une ligne dans un inventaire
 * @route   POST /api/v1/stock/inventaires/:id/lignes
 * @access  Privé (permission: 'manage:stock')
 */
exports.addInventaireLine = asyncHandler(async (req, res, next) => {
    const { id: inventaireId } = req.params;
    const { produitId, quantitePhysique } = req.body;

    if (!produitId || quantitePhysique === undefined) {
        return next(new AppError('Veuillez fournir un ID de produit et une quantité physique.', 400));
    }

    const inventaireMisAJour = await inventaireService.addOrUpdateInventaireLine(
        inventaireId,
        { produitId, quantitePhysique }
    );

    res.status(200).json({
        status: 'success',
        data: {
            inventaire: inventaireMisAJour,
        }
    });
});


/**
 * @desc    Valider un inventaire et appliquer les ajustements de stock
 * @route   POST /api/v1/stock/inventaires/:id/valider
 * @access  Privé (permission: 'manage:stock')
 */
exports.validateInventaire = asyncHandler(async (req, res, next) => {
    const { id: inventaireId } = req.params;
    
    const inventaireValide = await inventaireService.validateInventaire(inventaireId, req.user.id);
    
    res.status(200).json({
        status: 'success',
        message: 'Inventaire validé et ajustements de stock appliqués.',
        data: {
            inventaire: inventaireValide,
        }
    });
});


/**
 * @desc    Récupérer tous les inventaires
 * @route   GET /api/v1/stock/inventaires
 * @access  Privé (permission: 'read:stock')
 */
exports.getAllInventaires = asyncHandler(async (req, res, next) => {
  // TODO: Ajouter pagination et filtres
  const inventaires = await Inventaire.find({})
    .populate('depot', 'nom')
    .populate('realisePar', 'firstName lastName')
    .populate('validePar', 'firstName lastName')
    .sort({ dateInventaire: -1 });

  res.status(200).json({
    status: 'success',
    results: inventaires.length,
    data: {
      inventaires,
    },
  });
});


/**
 * @desc    Récupérer un inventaire par son ID
 * @route   GET /api/v1/stock/inventaires/:id
 * @access  Privé (permission: 'read:stock')
 */
exports.getInventaireById = asyncHandler(async (req, res, next) => {
  const inventaire = await Inventaire.findById(req.params.id)
    .populate('depot', 'nom')
    .populate('realisePar', 'firstName lastName')
    .populate('validePar', 'firstName lastName')
    .populate('lignes.produit', 'nom reference');

  if (!inventaire) {
    return next(new AppError('Aucun inventaire trouvé avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      inventaire,
    },
  });
});