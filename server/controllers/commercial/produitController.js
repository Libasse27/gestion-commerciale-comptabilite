// ==============================================================================
//           Contrôleur pour la Gestion des Produits (CRUD)
//
// MISE À JOUR : Ce contrôleur est maintenant "mince" et délègue toute la
// logique métier au `produitService`.
// ==============================================================================

const produitService = require('../../services/commercial/produitService');
const asyncHandler = require('../../utils/asyncHandler');
const auditLogService = require('../../services/system/auditLogService');
const { AUDIT_LOG_ACTIONS } = require('../../utils/constants');

/**
 * @desc    Créer un nouveau produit ou service
 * @route   POST /api/v1/produits
 */
exports.createProduit = asyncHandler(async (req, res, next) => {
  const newProduit = await produitService.createProduit(req.body, req.user.id);
  
  auditLogService.logAction({
      user: req.user.id, action: AUDIT_LOG_ACTIONS.CREATE, entity: 'Produit',
      entityId: newProduit._id, status: 'SUCCESS', ipAddress: req.ip,
  });

  res.status(201).json({
    status: 'success',
    data: { produit: newProduit },
  });
});

/**
 * @desc    Récupérer tous les produits et services
 * @route   GET /api/v1/produits
 */
exports.getAllProduits = asyncHandler(async (req, res, next) => {
  const produits = await produitService.getAllProduits(req.query);

  res.status(200).json({
    status: 'success',
    results: produits.length,
    data: { produits },
  });
});

/**
 * @desc    Récupérer un produit par son ID
 * @route   GET /api/v1/produits/:id
 */
exports.getProduitById = asyncHandler(async (req, res, next) => {
  const produit = await produitService.getProduitById(req.params.id);
  res.status(200).json({
    status: 'success',
    data: { produit },
  });
});

/**
 * @desc    Mettre à jour un produit
 * @route   PATCH /api/v1/produits/:id
 */
exports.updateProduit = asyncHandler(async (req, res, next) => {
  const produit = await produitService.updateProduit(req.params.id, req.body);
  
  auditLogService.logAction({
      user: req.user.id, action: AUDIT_LOG_ACTIONS.UPDATE, entity: 'Produit',
      entityId: produit._id, status: 'SUCCESS', ipAddress: req.ip,
      details: { changes: req.body }
  });

  res.status(200).json({
    status: 'success',
    data: { produit },
  });
});

/**
 * @desc    Supprimer (désactiver) un produit
 * @route   DELETE /api/v1/produits/:id
 */
exports.deleteProduit = asyncHandler(async (req, res, next) => {
  const produit = await produitService.deleteProduit(req.params.id);
  
  auditLogService.logAction({
      user: req.user.id, action: AUDIT_LOG_ACTIONS.DELETE, entity: 'Produit',
      entityId: produit._id, status: 'SUCCESS', ipAddress: req.ip,
  });

  res.status(204).json({
    status: 'success',
    data: null,
  });
});