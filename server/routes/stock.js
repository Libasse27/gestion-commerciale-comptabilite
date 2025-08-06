// server/routes/stock.js
const express = require('express');
const { protect } = require('../middleware/auth');

// Importer les sous-routeurs
const depotRoutes = require('./stock/depots');
const inventaireRoutes = require('./stock/inventaires');
const mouvementRoutes = require('./stock/mouvements');
const alerteRoutes = require('./stock/alertes');
const stockController = require('../controllers/stock/stockController');
const { checkPermission } = require('../middleware/permissions');


const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes de ce module
router.use(protect);

// Brancher les sous-routeurs sur leurs chemins respectifs
router.use('/depots', depotRoutes);
router.use('/inventaires', inventaireRoutes);
router.use('/mouvements', mouvementRoutes);
router.use('/alertes', alerteRoutes);

// Routes de consultation directe de l'état du stock
router.get('/etats', checkPermission('stock:read'), stockController.getEtatStockGlobal);
router.get('/etats/produit/:produitId', checkPermission('stock:read'), stockController.getStockParProduit);
router.get('/etats/level', checkPermission('stock:read'), stockController.getStockLevel);


module.exports = router;