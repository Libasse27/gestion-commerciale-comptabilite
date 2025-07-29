// ==============================================================================
//           Contrôleur pour la Gestion des Factures
//
// MISE À JOUR : Ajout d'une fonction pour le téléchargement de la facture en PDF.
// ==============================================================================

const Facture = require('../../models/commercial/Facture');
const facturationService = require('../../services/commercial/facturationService');
const ventesService = require('../../services/commercial/ventesService');
const pdfService = require('../../services/exports/pdfService'); // Import du service PDF
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

/**
 * @desc    Créer une nouvelle facture directe
 * @route   POST /api/v1/factures
 */
exports.createFacture = asyncHandler(async (req, res, next) => {
  // La logique de création est complexe et doit être dans un service.
  // Déplacer/renommer `ventesService.createFactureDirecte` vers `facturationService.createFacture`
  // serait idéal pour la cohérence.
  const nouvelleFacture = await facturationService.createFacture(req.body, req.user.id);
  res.status(201).json({
    status: 'success',
    data: { facture: nouvelleFacture },
  });
});

/**
 * @desc    Créer une nouvelle facture à partir d'une commande
 * @route   POST /api/v1/factures/from-commande
 */
exports.createFactureFromCommande = asyncHandler(async (req, res, next) => {
  const { commandeId } = req.body;
  if (!commandeId) {
    return next(new AppError('Veuillez fournir un ID de commande.', 400));
  }
  const nouvelleFacture = await facturationService.createFactureFromCommande(commandeId, req.user.id);
  res.status(201).json({
    status: 'success',
    data: { facture: nouvelleFacture },
  });
});

/**
 * @desc    Récupérer toutes les factures
 * @route   GET /api/v1/factures
 */
exports.getAllFactures = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Facture.find(), req.query)
      .filter().sort().limitFields().paginate();
      
  const factures = await features.query
    .populate('client', 'nom')
    .populate('creePar', 'firstName lastName');

  res.status(200).json({
    status: 'success',
    results: factures.length,
    data: { factures },
  });
});

/**
 * @desc    Récupérer une facture par son ID
 * @route   GET /api/v1/factures/:id
 */
exports.getFactureById = asyncHandler(async (req, res, next) => {
  const facture = await Facture.findById(req.params.id)
    .populate('client')
    .populate('creePar', 'firstName lastName')
    .populate('lignes.produit', 'nom reference');

  if (!facture) {
    return next(new AppError('Aucune facture trouvée avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: { facture },
  });
});

/**
 * @desc    Télécharger une facture en PDF
 * @route   GET /api/v1/factures/:id/pdf
 */
exports.downloadFacturePdf = asyncHandler(async (req, res, next) => {
    const facture = await Facture.findById(req.params.id);
    if (!facture) {
        return next(new AppError('Facture non trouvée.', 404));
    }

    // Délégation de la génération du PDF au service spécialisé
    const pdfBuffer = await pdfService.genererPdfFacture(facture);
    
    // Configuration des en-têtes de la réponse pour forcer le téléchargement
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=facture-${facture.numero}.pdf`);
    
    // Envoi du buffer PDF en réponse
    res.send(pdfBuffer);
});


/**
 * @desc    Enregistrer un paiement pour une facture
 * @route   POST /api/v1/factures/:id/paiements
 */
exports.addPaiement = asyncHandler(async (req, res, next) => {
  const paiementData = {
    ...req.body,
    clientId: (await Facture.findById(req.params.id)).client,
    factureIds: [req.params.id],
  };

  const resultat = await facturationService.enregistrerPaiement(paiementData, req.user.id);
  res.status(200).json({ status: 'success', data: resultat });
});

/**
 * @desc    Valider une facture pour la comptabilité
 * @route   POST /api/v1/factures/:id/valider
 */
exports.validerFacture = asyncHandler(async (req, res, next) => {
    const facture = await facturationService.validerFacturePourCompta(req.params.id, req.user.id);
    res.status(200).json({
        status: 'success',
        message: 'Facture validée et comptabilisée.',
        data: { facture }
    });
});