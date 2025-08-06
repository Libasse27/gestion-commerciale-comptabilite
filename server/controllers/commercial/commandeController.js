const Commande = require('../../models/commercial/Commande');
const ventesService = require('../../services/commercial/ventesService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

exports.getAllCommandes = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(
    Commande.find().populate('client', 'nom').populate('creePar', 'firstName lastName').populate('devisOrigine', 'numero'),
    req.query
  ).filter().sort().paginate();

  const commandes = await features.query;
  res.status(200).json({ status: 'success', results: commandes.length, data: { commandes } });
});

exports.getCommandeById = asyncHandler(async (req, res, next) => {
  const commande = await Commande.findById(req.params.id)
    .populate('client')
    .populate('creePar', 'firstName lastName')
    .populate('lignes.produit', 'nom reference')
    .populate('devisOrigine', 'numero dateEmission');

  if (!commande) return next(new AppError('Aucune commande trouvée avec cet ID.', 404));
  res.status(200).json({ status: 'success', data: { commande } });
});

exports.updateCommande = asyncHandler(async (req, res, next) => {
  const updatedCommande = await ventesService.updateCommande(req.params.id, req.body, req.user.id);
  res.status(200).json({ status: 'success', data: { commande: updatedCommande } });
});

exports.createBonLivraisonFromCommande = asyncHandler(async (req, res, next) => {
    const nouveauBonLivraison = await ventesService.createBonLivraisonFromCommande(req.params.id, req.body, req.user.id);
    res.status(201).json({
        status: 'success',
        message: 'Bon de livraison créé avec succès.',
        data: { bonLivraison: nouveauBonLivraison }
    });
});