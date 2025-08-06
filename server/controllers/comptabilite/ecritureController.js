const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const ecritureService = require('../../services/comptabilite/ecritureService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

exports.createEcriture = asyncHandler(async (req, res, next) => {
  const nouvelleEcriture = await ecritureService.createEcritureManuelle(req.body, req.user.id);
  res.status(201).json({ status: 'success', data: { ecriture: nouvelleEcriture } });
});

exports.getAllEcritures = asyncHandler(async (req, res, next) => {
    const features = new APIFeatures(
        EcritureComptable.find().populate('journal', 'code libelle').populate('creePar', 'firstName'),
        req.query
    ).filter().sort().paginate();
    
    const ecritures = await features.query;
    res.status(200).json({ status: 'success', results: ecritures.length, data: { ecritures } });
});

exports.getEcritureById = asyncHandler(async (req, res, next) => {
    const ecriture = await EcritureComptable.findById(req.params.id)
        .populate('journal', 'code libelle')
        .populate('creePar', 'firstName lastName')
        .populate('validePar', 'firstName lastName')
        .populate('lignes.compte', 'numero libelle');
        
    if (!ecriture) return next(new AppError('Aucune écriture trouvée avec cet ID.', 404));
    res.status(200).json({ status: 'success', data: { ecriture } });
});

exports.updateEcriture = asyncHandler(async (req, res, next) => {
    const updatedEcriture = await ecritureService.updateEcriture(req.params.id, req.body, req.user.id);
    res.status(200).json({ status: 'success', data: { ecriture: updatedEcriture } });
});

exports.deleteEcriture = asyncHandler(async (req, res, next) => {
    await ecritureService.deleteEcriture(req.params.id);
    res.status(204).json({ status: 'success', data: null });
});

exports.validerEcriture = asyncHandler(async (req, res, next) => {
    const ecritureValidee = await ecritureService.validerEcriture(req.params.id, req.user.id);
    res.status(200).json({ status: 'success', data: { ecriture: ecritureValidee } });
});