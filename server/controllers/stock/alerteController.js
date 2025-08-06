// server/controllers/stock/alerteController.js
const AlerteStock = require('../../models/stock/AlerteStock');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

/**
 * @desc    Récupérer toutes les alertes de stock
 * @route   GET /api/v1/stock/alertes
 */
exports.getAllAlertes = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    AlerteStock.find().populate('produit', 'nom reference').populate('depot', 'nom'),
    req.query
  ).filter().sort().paginate();

  const alertes = await features.query;

  res.status(200).json({
    status: 'success',
    results: alertes.length,
    data: { alertes },
  });
});

/**
 * @desc    Récupérer une alerte par son ID
 * @route   GET /api/v1/stock/alertes/:id
 */
exports.getAlerteById = asyncHandler(async (req, res, next) => {
    const alerte = await AlerteStock.findById(req.params.id)
      .populate('produit', 'nom reference')
      .populate('depot', 'nom')
      .populate('resoluPar', 'firstName lastName');
      
    if (!alerte) {
        return next(new AppError('Aucune alerte trouvée avec cet ID.', 404));
    }
    res.status(200).json({ status: 'success', data: { alerte } });
});

/**
 * @desc    Mettre à jour le statut d'une alerte (la résoudre ou l'ignorer)
 * @route   PATCH /api/v1/stock/alertes/:id
 */
exports.updateAlerteStatut = asyncHandler(async (req, res, next) => {
  const { statut } = req.body;
  if (!statut || !['Resolue', 'Ignoree'].includes(statut)) {
    return next(new AppError('Le statut fourni est invalide. Statuts autorisés : Resolue, Ignoree.', 400));
  }
  
  const alerte = await AlerteStock.findById(req.params.id);
  if (!alerte) return next(new AppError('Aucune alerte trouvée avec cet ID.', 404));
  if (alerte.statut !== 'Active') {
      return next(new AppError(`L'alerte est déjà au statut "${alerte.statut}".`, 400));
  }

  alerte.statut = statut;
  alerte.resoluPar = req.user.id;
  alerte.dateResolution = new Date();
  
  await alerte.save();
  res.status(200).json({ status: 'success', data: { alerte } });
});