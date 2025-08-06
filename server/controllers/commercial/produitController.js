// server/controllers/commercial/produitController.js
const produitService = require('../../services/commercial/produitService');
const asyncHandler = require('../../utils/asyncHandler');
const auditLogService = require('../../services/system/auditLogService');
const Produit = require('../../models/commercial/Produit'); // Pour le `logUpdate`

exports.createProduit = asyncHandler(async (req, res, next) => {
  const newProduit = await produitService.createProduit(req.body, req.user.id);
  
  auditLogService.logCreate({
      user: req.user.id, entity: 'Produit', entityId: newProduit._id, ipAddress: req.ip
  });

  res.status(201).json({ status: 'success', data: { produit: newProduit } });
});

exports.getAllProduits = asyncHandler(async (req, res, next) => {
  const produits = await produitService.getAllProduits(req.query);
  // Pour la pagination, le service devrait renvoyer plus d'infos,
  // mais pour l'instant, c'est suffisant.
  res.status(200).json({
    status: 'success',
    results: produits.length,
    data: { produits },
  });
});

exports.getProduitById = asyncHandler(async (req, res, next) => {
  const produit = await produitService.getProduitById(req.params.id);
  res.status(200).json({ status: 'success', data: { produit } });
});

exports.updateProduit = asyncHandler(async (req, res, next) => {
  const produitBefore = await Produit.findById(req.params.id).lean();
  const updatedProduit = await produitService.updateProduit(req.params.id, req.body, req.user.id);
  
  auditLogService.logUpdate(
      { user: req.user.id, entity: 'Produit', entityId: updatedProduit._id, ipAddress: req.ip },
      produitBefore, updatedProduit.toObject()
  );

  res.status(200).json({ status: 'success', data: { produit: updatedProduit } });
});

exports.deleteProduit = asyncHandler(async (req, res, next) => {
  const produit = await produitService.deleteProduit(req.params.id, req.user.id);
  
  auditLogService.logUpdate(
      { user: req.user.id, entity: 'Produit', entityId: produit._id, ipAddress: req.ip },
      { isActive: true }, { isActive: false }
  );

  res.status(204).json({ status: 'success', data: null });
});