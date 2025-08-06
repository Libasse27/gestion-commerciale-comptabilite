const Inventaire = require('../../models/stock/Inventaire');
const inventaireService = require('../../services/stock/inventaireService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

exports.startInventaire = asyncHandler(async (req, res, next) => {
  const { depotId } = req.body;
  if (!depotId) return next(new AppError('Un ID de dépôt est requis.', 400));
  const nouvelInventaire = await inventaireService.startInventaire(depotId, req.user.id);
  res.status(201).json({ status: 'success', data: { inventaire: nouvelInventaire } });
});

exports.addOrUpdateLine = asyncHandler(async (req, res, next) => {
    const { id: inventaireId } = req.params;
    const { produitId, quantitePhysique } = req.body;
    if (!produitId || quantitePhysique === undefined) {
        return next(new AppError('Un ID de produit et une quantité sont requis.', 400));
    }
    const inventaire = await inventaireService.addOrUpdateInventaireLine(inventaireId, { produitId, quantitePhysique });
    res.status(200).json({ status: 'success', data: { inventaire } });
});

exports.validateInventaire = asyncHandler(async (req, res, next) => {
    const inventaireValide = await inventaireService.validateInventaire(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', data: { inventaire: inventaireValide } });
});

exports.getAllInventaires = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Inventaire.find().populate('depot', 'nom').populate('realisePar', 'firstName lastName').populate('validePar', 'firstName lastName'),
    req.query
  ).filter().sort().paginate();

  const inventaires = await features.query;
  res.status(200).json({ status: 'success', results: inventaires.length, data: { inventaires } });
});

exports.getInventaireById = asyncHandler(async (req, res, next) => {
  const inventaire = await Inventaire.findById(req.params.id)
    .populate('depot', 'nom')
    .populate('realisePar', 'firstName lastName')
    .populate('validePar', 'firstName lastName')
    .populate('lignes.produit', 'nom reference');
  if (!inventaire) return next(new AppError('Aucun inventaire trouvé avec cet ID.', 404));
  res.status(200).json({ status: 'success', data: { inventaire } });
});