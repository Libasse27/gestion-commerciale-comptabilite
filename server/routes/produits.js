// server/routes/produits.js
const express = require('express');
const produitController = require('../controllers/commercial/produitController');
const categorieController = require('../controllers/commercial/categorieController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
router.use(protect);

// --- Routes pour les Produits ---
router.route('/')
  .post(checkPermission('produit:manage'), produitController.createProduit)
  .get(checkPermission('produit:read'), produitController.getAllProduits);

router.route('/:id')
  .get(checkPermission('produit:read'), produitController.getProduitById)
  .patch(checkPermission('produit:manage'), produitController.updateProduit)
  .delete(checkPermission('produit:manage'), produitController.deleteProduit);

// --- Routes pour les Catégories ---
router.route('/categories/all')
  .get(checkPermission('produit:read'), categorieController.getAllCategories)
  .post(checkPermission('produit:manage'), categorieController.createCategorie);

router.route('/categories/:id')
    .patch(checkPermission('produit:manage'), categorieController.updateCategorie)
    .delete(checkPermission('produit:manage'), categorieController.deleteCategorie);

module.exports = router;