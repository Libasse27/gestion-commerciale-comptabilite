// server/controllers/commercial/fournisseurController.js
const Fournisseur = require('../../models/commercial/Fournisseur');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');
const auditLogService = require('../../services/system/auditLogService');

exports.createFournisseur = asyncHandler(async (req, res, next) => {
  const newFournisseur = await Fournisseur.create({ ...req.body, creePar: req.user.id });
  auditLogService.logCreate({ user: req.user.id, entity: 'Fournisseur', entityId: newFournisseur._id, ipAddress: req.ip });
  res.status(201).json({ status: 'success', data: { fournisseur: newFournisseur } });
});

exports.getAllFournisseurs = asyncHandler(async (req, res, next) => {
  const searchableFields = ['nom', 'codeFournisseur', 'email', 'telephone'];
  const baseQuery = Fournisseur.find({ isActive: true });

  const totalFeatures = new APIFeatures(baseQuery.clone(), req.query).filter().search(searchableFields);
  const totalFournisseurs = await totalFeatures.query.countDocuments();

  const features = new APIFeatures(baseQuery, req.query)
    .filter().sort().search(searchableFields).limitFields().paginate();
  
  const fournisseurs = await features.query.populate('creePar', 'firstName lastName');

  const limit = parseInt(req.query.limit) || 20;
  res.status(200).json({
    status: 'success',
    results: fournisseurs.length,
    pagination: {
        total: totalFournisseurs,
        limit,
        page: parseInt(req.query.page) || 1,
        pages: Math.ceil(totalFournisseurs / limit),
    },
    data: { fournisseurs },
  });
});

exports.getFournisseurById = asyncHandler(async (req, res, next) => {
  const fournisseur = await Fournisseur.findById(req.params.id);
  if (!fournisseur) return next(new AppError('Aucun fournisseur trouvé avec cet ID.', 404));
  res.status(200).json({ status: 'success', data: { fournisseur } });
});

exports.updateFournisseur = asyncHandler(async (req, res, next) => {
  const fournisseurBefore = await Fournisseur.findById(req.params.id).lean();
  if (!fournisseurBefore) return next(new AppError('Aucun fournisseur trouvé avec cet ID.', 404));

  const updatedFournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, { ...req.body, modifiePar: req.user.id }, { new: true, runValidators: true });
  
  auditLogService.logUpdate({ user: req.user.id, entity: 'Fournisseur', entityId: updatedFournisseur._id, ipAddress: req.ip }, fournisseurBefore, updatedFournisseur.toObject());
  res.status(200).json({ status: 'success', data: { fournisseur: updatedFournisseur } });
});

exports.deleteFournisseur = asyncHandler(async (req, res, next) => {
  const fournisseur = await Fournisseur.findByIdAndUpdate(req.params.id, { isActive: false, modifiePar: req.user.id });
  if (!fournisseur) return next(new AppError('Aucun fournisseur trouvé avec cet ID.', 404));

  auditLogService.logUpdate({ user: req.user.id, entity: 'Fournisseur', entityId: fournisseur._id, ipAddress: req.ip }, { isActive: true }, { isActive: false });
  res.status(204).json({ status: 'success', data: null });
});