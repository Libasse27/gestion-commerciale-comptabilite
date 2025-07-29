// ==============================================================================
//           Contrôleur pour la Gestion des Alertes de Stock
//
// Ce contrôleur gère les requêtes HTTP pour la consultation et la gestion
// des alertes de stock. Il permet au frontend d'afficher les alertes
// actives et de les marquer comme résolues ou ignorées.
// ==============================================================================

const AlerteStock = require('../../models/stock/AlerteStock');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Récupérer toutes les alertes de stock (avec filtres)
 * @route   GET /api/v1/stock/alertes
 * @access  Privé (permission: 'read:stock')
 */
exports.getAllAlertes = asyncHandler(async (req, res, next) => {
  // Permet de filtrer par statut (ex: /alertes?statut=Active)
  const filter = {};
  if (req.query.statut) {
    filter.statut = req.query.statut;
  }
  
  // TODO: Ajouter la pagination
  
  const alertes = await AlerteStock.find(filter)
    .populate('produit', 'nom reference')
    .populate('depot', 'nom')
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: 'success',
    results: alertes.length,
    data: {
      alertes,
    },
  });
});


/**
 * @desc    Récupérer une alerte de stock par son ID
 * @route   GET /api/v1/stock/alertes/:id
 * @access  Privé (permission: 'read:stock')
 */
exports.getAlerteById = asyncHandler(async (req, res, next) => {
    const alerte = await AlerteStock.findById(req.params.id)
      .populate('produit', 'nom reference')
      .populate('depot', 'nom');
      
    if (!alerte) {
        return next(new AppError('Aucune alerte trouvée avec cet identifiant.', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            alerte,
        }
    });
});


/**
 * @desc    Mettre à jour le statut d'une alerte
 * @route   PATCH /api/v1/stock/alertes/:id
 * @access  Privé (permission: 'manage:stock')
 */
exports.updateAlerteStatut = asyncHandler(async (req, res, next) => {
  const { statut } = req.body;

  if (!statut || !['Resolue', 'Ignoree'].includes(statut)) {
    return next(new AppError('Le statut fourni est invalide. Statuts autorisés : Resolue, Ignoree.', 400));
  }
  
  const alerte = await AlerteStock.findById(req.params.id);
  
  if (!alerte) {
    return next(new AppError('Aucune alerte trouvée avec cet identifiant.', 404));
  }
  
  if (alerte.statut !== 'Active') {
      return next(new AppError(`L'alerte est déjà en statut "${alerte.statut}" et ne peut plus être modifiée.`, 400));
  }

  alerte.statut = statut;
  alerte.resoluPar = req.user.id;
  alerte.dateResolution = new Date();
  
  await alerte.save();
  
  res.status(200).json({
    status: 'success',
    data: {
      alerte,
    },
  });
});