const Devis = require('../../models/commercial/Devis');
const ventesService = require('../../services/commercial/ventesService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

exports.createDevis = asyncHandler(async (req, res, next) => {
  const nouveauDevis = await ventesService.createDevis(req.body, req.user.id);
  res.status(201).json({ status: 'success', data: { devis: nouveauDevis } });
});

exports.getAllDevis = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Devis.find().populate('client', 'nom').populate('creePar', 'firstName lastName'),
    req.query
  ).filter().sort().paginate();
  
  const devis = await features.query;
  res.status(200).json({ status: 'success', results: devis.length, data: { devis } });
});

exports.getDevisById = asyncHandler(async (req, res, next) => {
  const devis = await Devis.findById(req.params.id)
    .populate('client')
    .populate('creePar', 'firstName lastName')
    .populate('lignes.produit', 'nom reference');

  if (!devis) return next(new AppError('Aucun devis trouvé avec cet ID.', 404));
  res.status(200).json({ status: 'success', data: { devis } });
});

exports.updateDevis = asyncHandler(async (req, res, next) => {
  const updatedDevis = await ventesService.updateDevis(req.params.id, req.body, req.user.id);
  res.status(200).json({ status: 'success', data: { devis: updatedDevis } });
});

exports.deleteDevis = asyncHandler(async (req, res, next) => {
    // La suppression est souvent une modification de statut (ex: 'Annulé')
    const devis = await Devis.findById(req.params.id);
    if (!devis) return next(new AppError('Devis non trouvé', 404));
    if (devis.statut !== 'brouillon') {
        return next(new AppError('Seul un devis en brouillon peut être annulé.', 400));
    }
    devis.statut = 'annule';
    await devis.save();
    res.status(204).json({ status: 'success', data: null });
});

exports.convertToCommande = asyncHandler(async (req, res, next) => {
    const nouvelleCommande = await ventesService.convertDevisToCommande(req.params.id, req.user.id);
    res.status(201).json({
        status: 'success',
        message: 'Devis converti en commande.',
        data: { commande: nouvelleCommande }
    });
});