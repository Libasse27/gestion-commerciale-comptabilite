// server/controllers/stock/depotController.js
const Depot = require('../../models/stock/Depot');
const Stock = require('../../models/stock/Stock'); // Pour vérifier l'utilisation avant suppression
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');
const auditLogService = require('../../services/system/auditLogService');

/**
 * @desc    Créer un nouveau dépôt
 * @route   POST /api/v1/stock/depots
 * @access  Privé (permission: 'stock:manage')
 */
exports.createDepot = asyncHandler(async (req, res, next) => {
  const newDepot = await Depot.create({ ...req.body, creePar: req.user.id });
  
  auditLogService.logCreate({
      user: req.user.id, entity: 'Depot', entityId: newDepot._id, ipAddress: req.ip
  });
  
  res.status(201).json({ status: 'success', data: { depot: newDepot } });
});


/**
 * @desc    Récupérer tous les dépôts
 * @route   GET /api/v1/stock/depots
 * @access  Privé (permission: 'stock:read')
 */
exports.getAllDepots = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Depot.find({ isActive: true }).populate('creePar', 'firstName lastName'),
    req.query
  ).sort().paginate();
  
  const depots = await features.query;
  
  res.status(200).json({ status: 'success', results: depots.length, data: { depots } });
});


/**
 * @desc    Récupérer un dépôt par son ID
 * @route   GET /api/v1/stock/depots/:id
 * @access  Privé (permission: 'stock:read')
 */
exports.getDepotById = asyncHandler(async (req, res, next) => {
  const depot = await Depot.findById(req.params.id);
  if (!depot) return next(new AppError('Aucun dépôt trouvé avec cet ID.', 404));
  res.status(200).json({ status: 'success', data: { depot } });
});


/**
 * @desc    Mettre à jour un dépôt
 * @route   PATCH /api/v1/stock/depots/:id
 * @access  Privé (permission: 'stock:manage')
 */
exports.updateDepot = asyncHandler(async (req, res, next) => {
  const depotBefore = await Depot.findById(req.params.id).lean();
  if (!depotBefore) return next(new AppError('Aucun dépôt trouvé avec cet ID.', 404));
  
  const updatedDepot = await Depot.findByIdAndUpdate(req.params.id, { ...req.body, modifiePar: req.user.id }, { new: true, runValidators: true });
  
  auditLogService.logUpdate(
    { user: req.user.id, entity: 'Depot', entityId: updatedDepot._id, ipAddress: req.ip },
    depotBefore, updatedDepot.toObject()
  );
  
  res.status(200).json({ status: 'success', data: { depot: updatedDepot } });
});


/**
 * @desc    Désactiver un dépôt (soft delete)
 * @route   DELETE /api/v1/stock/depots/:id
 * @access  Privé (permission: 'stock:manage')
 */
exports.deleteDepot = asyncHandler(async (req, res, next) => {
  // Règle métier : Ne pas désactiver un dépôt s'il contient encore du stock.
  const stockCount = await Stock.countDocuments({ depot: req.params.id, quantite: { $gt: 0 } });
  if (stockCount > 0) {
    return next(new AppError(`Impossible de désactiver ce dépôt car il contient encore ${stockCount} article(s) en stock.`, 400));
  }
  
  const depot = await Depot.findByIdAndUpdate(req.params.id, { isActive: false, modifiePar: req.user.id });
  if (!depot) return next(new AppError('Aucun dépôt trouvé avec cet ID.', 404));

  auditLogService.logUpdate(
    { user: req.user.id, entity: 'Depot', entityId: depot._id, ipAddress: req.ip },
    { isActive: true }, { isActive: false }
  );
  
  res.status(204).json({ status: 'success', data: null });
});