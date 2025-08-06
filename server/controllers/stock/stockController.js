const Stock = require('../../models/stock/Stock');
const stockService = require('../../services/stock/stockService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

exports.getEtatStockGlobal = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Stock.find().populate('produit', 'nom reference type').populate('depot', 'nom'),
    req.query
  ).filter().sort().paginate();

  const etatsStock = await features.query;

  res.status(200).json({
    status: 'success',
    results: etatsStock.length,
    data: { etatsStock },
  });
});

exports.getStockParProduit = asyncHandler(async (req, res, next) => {
  const { produitId } = req.params;
  const etatsStock = await Stock.find({ produit: produitId }).populate('depot', 'nom').lean();
  res.status(200).json({ status: 'success', data: { etatsStock } });
});

exports.getStockLevel = asyncHandler(async (req, res, next) => {
    const { produitId, depotId } = req.query;
    if (!produitId || !depotId) {
        return next(new AppError('Veuillez fournir un produitId et un depotId.', 400));
    }
    const quantite = await stockService.getStockLevel(produitId, depotId);
    res.status(200).json({ status: 'success', data: { quantite } });
});