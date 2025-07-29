// ==============================================================================
//           Contrôleur pour la Gestion des Paiements
//
// Ce contrôleur gère les requêtes HTTP pour les opérations sur les paiements,
// telles que l'enregistrement des encaissements et des décaissements.
//
// Il délègue toute la logique métier complexe au `paiementService`.
// ==============================================================================

const Paiement = require('../../models/paiements/Paiement');
const paiementService = require('../../services/paiements/paiementService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Enregistrer un nouvel encaissement client
 * @route   POST /api/v1/paiements/encaissements
 * @access  Privé (permission: 'manage:paiement')
 */
exports.createEncaissement = asyncHandler(async (req, res, next) => {
  // TODO: Ajouter une validation plus poussée des données du body (req.body)
  const paiementData = req.body;
  
  if (!paiementData.clientId || !paiementData.montant || !paiementData.imputations) {
      return next(new AppError('Les données requises (clientId, montant, imputations) sont manquantes.', 400));
  }
  
  const nouveauPaiement = await paiementService.enregistrerEncaissementClient(paiementData, req.user.id);

  res.status(201).json({
    status: 'success',
    data: {
      paiement: nouveauPaiement,
    },
  });
});

/**
 * @desc    Enregistrer un nouveau décaissement fournisseur
 * @route   POST /api/v1/paiements/decaissements
 * @access  Privé (permission: 'manage:paiement')
 */
exports.createDecaissement = asyncHandler(async (req, res, next) => {
    // TODO: Implémenter la logique dans `paiementService.enregistrerDecaissementFournisseur`
    res.status(501).json({ // 501 Not Implemented
        status: 'in_progress',
        message: 'La gestion des décaissements est en cours de développement.'
    });
});


/**
 * @desc    Récupérer tous les paiements
 * @route   GET /api/v1/paiements
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getAllPaiements = asyncHandler(async (req, res, next) => {
  // TODO: Implémenter la pagination et les filtres (par date, par tiers, par sens)
  const paiements = await Paiement.find({})
    .populate('tiers', 'nom') // Peuple dynamiquement le client ou le fournisseur
    .populate('modePaiement', 'nom')
    .populate('enregistrePar', 'firstName lastName')
    .sort({ datePaiement: -1 });

  res.status(200).json({
    status: 'success',
    results: paiements.length,
    data: {
      paiements,
    },
  });
});

/**
 * @desc    Récupérer un paiement par son ID
 * @route   GET /api/v1/paiements/:id
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getPaiementById = asyncHandler(async (req, res, next) => {
  const paiement = await Paiement.findById(req.params.id)
    .populate('tiers', 'nom codeClient codeFournisseur')
    .populate('modePaiement')
    .populate('compteTresorerie', 'numero libelle')
    .populate('enregistrePar', 'firstName lastName')
    .populate({ // Populate imbriqué pour voir le numéro de la facture imputée
        path: 'imputations.facture',
        select: 'numero totalTTC'
    });

  if (!paiement) {
    return next(new AppError('Aucun paiement trouvé avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      paiement,
    },
  });
});