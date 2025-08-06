// server/controllers/paiements/paiementController.js
const Paiement = require('../../models/paiements/Paiement');
const paiementService = require('../../services/paiements/paiementService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');
const auditLogService = require('../../services/system/auditLogService');

exports.createEncaissement = asyncHandler(async (req, res, next) => {
  const paiementData = req.body;
  
  // Le service gère déjà la validation des montants
  const nouveauPaiement = await paiementService.enregistrerEncaissementClient(paiementData, req.user.id);

  auditLogService.logCreate({
    user: req.user.id, entity: 'Paiement', entityId: nouveauPaiement._id, ipAddress: req.ip
  });

  res.status(201).json({ status: 'success', data: { paiement: nouveauPaiement } });
});

exports.createDecaissement = asyncHandler(async (req, res, next) => {
    const paiementData = req.body;
    const nouveauPaiement = await paiementService.enregistrerDecaissementFournisseur(paiementData, req.user.id);
    
    auditLogService.logCreate({
        user: req.user.id, entity: 'Paiement', entityId: nouveauPaiement._id, ipAddress: req.ip
    });

    res.status(201).json({ status: 'success', data: { paiement: nouveauPaiement } });
});

exports.getAllPaiements = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Paiement.find()
      .populate('tiers', 'nom')
      .populate('modePaiement', 'nom')
      .populate('enregistrePar', 'firstName lastName'),
    req.query
  ).filter().sort().paginate();
  
  const paiements = await features.query;
  
  res.status(200).json({ status: 'success', results: paiements.length, data: { paiements } });
});

exports.getPaiementById = asyncHandler(async (req, res, next) => {
  const paiement = await Paiement.findById(req.params.id)
    .populate('tiers', 'nom codeClient codeFournisseur')
    .populate('modePaiement')
    .populate('compteTresorerie', 'numero libelle')
    .populate('enregistrePar', 'firstName lastName')
    .populate({
        path: 'imputations.facture',
        select: 'numero totalTTC'
    });

  if (!paiement) return next(new AppError('Aucun paiement trouvé avec cet ID.', 404));
  res.status(200).json({ status: 'success', data: { paiement } });
});