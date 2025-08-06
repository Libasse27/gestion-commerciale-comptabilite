// server/controllers/commercial/categorieController.js
const Categorie = require('../../models/commercial/Categorie');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');

exports.createCategorie = asyncHandler(async (req, res, next) => {
  const categorie = await Categorie.create({ ...req.body, creePar: req.user.id });
  res.status(201).json({ status: 'success', data: { categorie } });
});

exports.getAllCategories = asyncHandler(async (req, res, next) => {
  const categories = await Categorie.find({ isActive: true });
  res.status(200).json({ status: 'success', data: { categories } });
});

exports.updateCategorie = asyncHandler(async (req, res, next) => {
    const categorie = await Categorie.findByIdAndUpdate(req.params.id, { ...req.body, modifiePar: req.user.id }, { new: true, runValidators: true });
    if (!categorie) return next(new AppError('Catégorie non trouvée.', 404));
    res.status(200).json({ status: 'success', data: { categorie } });
});

exports.deleteCategorie = asyncHandler(async (req, res, next) => {
    // TODO: Ajouter une vérification pour ne pas supprimer une catégorie si elle est utilisée par des produits.
    const categorie = await Categorie.findByIdAndUpdate(req.params.id, { isActive: false, modifiePar: req.user.id });
    if (!categorie) return next(new AppError('Catégorie non trouvée.', 404));
    res.status(204).json({ status: 'success', data: null });
});