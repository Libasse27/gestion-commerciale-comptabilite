// server/routes/comptabilite.js
const express = require('express');
const { protect } = require('../middleware/auth');

// Importer les sous-routeurs
const planRoutes = require('./comptabilite/plan');
const ecrituresRoutes = require('./comptabilite/ecritures');
const rapportsRoutes = require('./comptabilite/rapports');
const comptaController = require('../controllers/comptabilite/comptabiliteController');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
router.use(protect); // Sécuriser toutes les routes comptables

// Brancher les sous-routeurs
router.use('/plan-comptable', planRoutes);
router.use('/ecritures', ecrituresRoutes);
router.use('/rapports', rapportsRoutes);

// Route pour le grand livre (qui est une consultation spécifique)
router.get('/grand-livre/:compteId', checkPermission('comptabilite:read'), comptaController.getGrandLivreCompte);

module.exports = router;