// ==============================================================================
//           Contrôleur pour la Gestion des Commandes (CRUD & Actions)
//
// Ce contrôleur gère les requêtes HTTP pour les opérations sur les commandes
// clients. Il délègue la logique métier complexe au `ventesService`.
// ==============================================================================

const Commande = require('../../models/commercial/Commande');
const ventesService = require('../../services/commercial/ventesService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Récupérer toutes les commandes
 * @route   GET /api/v1/commandes
 * @access  Privé (permission: 'read:vente')
 */
exports.getAllCommandes = asyncHandler(async (req, res, next) => {
  // TODO: Implémenter la pagination, le filtrage (par client, par statut), etc.
  const commandes = await Commande.find({})
    .populate('client', 'nom')
    .populate('creePar', 'firstName lastName')
    .populate('devisOrigine', 'numero') // Peuple le numéro du devis d'origine
    .sort({ dateCommande: -1 });

  res.status(200).json({
    status: 'success',
    results: commandes.length,
    data: {
      commandes,
    },
  });
});

/**
 * @desc    Récupérer une commande par son ID
 * @route   GET /api/v1/commandes/:id
 * @access  Privé (permission: 'read:vente')
 */
exports.getCommandeById = asyncHandler(async (req, res, next) => {
  const commande = await Commande.findById(req.params.id)
    .populate('client')
    .populate('creePar', 'firstName lastName')
    .populate('lignes.produit', 'nom reference')
    .populate('devisOrigine', 'numero dateEmission');

  if (!commande) {
    return next(new AppError('Aucune commande trouvée avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      commande,
    },
  });
});

/**
 * @desc    Mettre à jour une commande
 * @route   PATCH /api/v1/commandes/:id
 * @access  Privé (permission: 'update:vente')
 */
exports.updateCommande = asyncHandler(async (req, res, next) => {
  // TODO: La mise à jour d'une commande peut avoir des impacts sur le stock.
  // Cette logique devrait être encapsulée dans un `ventesService.updateCommande`.
  const commande = await Commande.findById(req.params.id);

  if (!commande) {
    return next(new AppError('Aucune commande trouvée avec cet identifiant.', 404));
  }
  
  // Exemple de règle métier : on ne peut modifier une commande que si elle est en préparation
  if (commande.statut !== 'en_preparation') {
      return next(new AppError(`Une commande avec le statut '${commande.statut}' ne peut plus être modifiée.`, 400));
  }
  
  const updatedCommande = await Commande.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      commande: updatedCommande,
    },
  });
});

/**
 * @desc    Créer un bon de livraison à partir d'une commande
 * @route   POST /api/v1/commandes/:id/creer-bon-livraison
 * @access  Privé (permission: 'create:vente') // Ou une permission plus spécifique
 */
exports.createBonLivraisonFromCommande = asyncHandler(async (req, res, next) => {
    const { commandeId } = req.params;
    const userId = req.user.id;
    
    // La logique métier sera dans un service, potentiellement le ventesService ou un futur livraisonService
    // const nouveauBonLivraison = await ventesService.createBonLivraison(commandeId, req.body.lignes, userId);

    // Pour l'instant, une réponse factice
    res.status(201).json({
        status: 'success',
        message: 'Bon de livraison créé avec succès (logique à implémenter).',
        // data: { bonLivraison: nouveauBonLivraison }
    });
});