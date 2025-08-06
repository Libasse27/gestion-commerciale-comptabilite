// server/controllers/paiements/echeancierController.js
const Echeancier = require('../../models/paiements/Echeancier');
const Facture = require('../../models/commercial/Facture');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

exports.createEcheancier = asyncHandler(async (req, res, next) => {
  const { factureId, lignes } = req.body;
  if (!factureId || !lignes) {
      return next(new AppError('Veuillez fournir un ID de facture et les lignes de l\'échéancier.', 400));
  }
  
  const facture = await Facture.findById(factureId).lean();
  if (!facture) return next(new AppError('Facture non trouvée.', 404));

  const nouvelEcheancier = await Echeancier.create({
    facture: factureId,
    client: facture.client,
    lignes: lignes,
    creePar: req.user.id,
  });

  res.status(201).json({ status: 'success', data: { echeancier: nouvelEcheancier } });
});

exports.getAllEcheanciers = asyncHandler(async (req, res, next) => {
    const features = new APIFeatures(
        Echeancier.find().populate('facture', 'numero totalTTC').populate('client', 'nom'),
        req.query
    ).filter().sort().paginate();

    const echeanciers = await features.query;
    res.status(200).json({ status: 'success', results: echeanciers.length, data: { echeanciers } });
});

exports.getEcheancierByFacture = asyncHandler(async (req, res, next) => {
  const { factureId } = req.params;
  const echeancier = await Echeancier.findOne({ facture: factureId })
    .populate('facture', 'numero totalTTC')
    .populate('client', 'nom');
    
  if (!echeancier) return next(new AppError('Aucun échéancier trouvé pour cette facture.', 404));
  res.status(200).json({ status: 'success', data: { echeancier } });
});

exports.updateEcheancier = asyncHandler(async (req, res, next) => {
  const echeancier = await Echeancier.findById(req.params.id);
  if (!echeancier) return next(new AppError('Aucun échéancier trouvé avec cet ID.', 404));
  if (echeancier.statut !== 'En cours') {
      return next(new AppError(`Cet échéancier est ${echeancier.statut} et ne peut plus être modifié.`, 403));
  }
  
  const updatedEcheancier = await Echeancier.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
  });

  res.status(200).json({ status: 'success', data: { echeancier: updatedEcheancier } });
});

exports.deleteEcheancier = asyncHandler(async (req, res, next) => {
    const echeancier = await Echeancier.findByIdAndUpdate(req.params.id, { statut: 'Annulé' }, { new: true });
    if (!echeancier) return next(new AppError('Aucun échéancier trouvé avec cet ID.', 404));
    res.status(204).json({ status: 'success', data: null });
});