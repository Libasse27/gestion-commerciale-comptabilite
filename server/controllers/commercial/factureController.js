const Facture = require('../../models/commercial/Facture');
const facturationService = require('../../services/commercial/facturationService');
const paiementService = require('../../services/paiements/paiementService');
const pdfService = require('../../services/exports/pdfService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

exports.createFactureFromCommande = asyncHandler(async (req, res, next) => {
  const { commandeId } = req.body;
  if (!commandeId) return next(new AppError('Veuillez fournir un ID de commande.', 400));
  const nouvelleFacture = await facturationService.createFactureFromCommande(commandeId, req.user.id);
  res.status(201).json({ status: 'success', data: { facture: nouvelleFacture } });
});

exports.getAllFactures = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Facture.find().populate('client', 'nom').populate('creePar', 'firstName lastName'),
    req.query
  ).filter().sort().paginate();
  
  const factures = await features.query;
  res.status(200).json({ status: 'success', results: factures.length, data: { factures } });
});

exports.getFactureById = asyncHandler(async (req, res, next) => {
  const facture = await Facture.findById(req.params.id)
    .populate('client')
    .populate('creePar', 'firstName lastName')
    .populate('lignes.produit', 'nom reference');
  if (!facture) return next(new AppError('Aucune facture trouvée avec cet ID.', 404));
  res.status(200).json({ status: 'success', data: { facture } });
});

exports.downloadFacturePdf = asyncHandler(async (req, res, next) => {
    const facture = await Facture.findById(req.params.id);
    if (!facture) return next(new AppError('Facture non trouvée.', 404));

    const pdfBuffer = await pdfService.genererPdfFacture(facture);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${facture.numero}.pdf`);
    res.send(pdfBuffer);
});

exports.addPaiementToFacture = asyncHandler(async (req, res, next) => {
    const facture = await Facture.findById(req.params.id).lean();
    if (!facture) return next(new AppError('Facture non trouvée.', 404));

    const paiementData = {
        ...req.body,
        clientId: facture.client,
        // L'imputation est simple car on paie une seule facture
        imputations: [{ factureId: req.params.id, montantImpute: req.body.montant }],
    };
    
    const nouveauPaiement = await paiementService.enregistrerEncaissementClient(paiementData, req.user.id);
    res.status(201).json({ status: 'success', data: { paiement: nouveauPaiement } });
});

exports.validerFacture = asyncHandler(async (req, res, next) => {
    const facture = await facturationService.validerFacture(req.params.id, req.user.id);
    res.status(200).json({
        status: 'success',
        message: 'Facture validée et comptabilisée.',
        data: { facture }
    });
});