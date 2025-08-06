// server/routes/paiements.js
const express = require('express');
const { protect } = require('../middleware/auth');

// Importer les contrôleurs et sous-routeurs
const paiementController = require('../controllers/paiements/paiementController');
const mobileMoneyController = require('../controllers/paiements/mobileMoneyController');
const echeancierRoutes = require('./paiements/echeanciers');
const relanceRoutes = require('./paiements/relances');
const mobileMoneyRoutes = require('./paiements/mobileMoney');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();

// --- WEBHOOKS (Publics, mais sécurisés par signature) ---
// Doit être défini AVANT `router.use(protect)`
router.post('/mobile-money/webhook/wave', express.raw({type: 'application/json'}), mobileMoneyController.handleWaveWebhook);


// Appliquer le middleware d'authentification à toutes les routes qui suivent
router.use(protect);

// --- SOUS-ROUTEURS ---
router.use('/echeanciers', echeancierRoutes);
router.use('/relances', relanceRoutes);
router.use('/mobile-money', mobileMoneyRoutes);

// --- ROUTES PRINCIPALES (Transactions) ---
router.route('/')
    .get(checkPermission('comptabilite:read'), paiementController.getAllPaiements);

router.post('/encaissements', checkPermission('paiement:manage'), paiementController.createEncaissement);
router.post('/decaissements', checkPermission('paiement:manage'), paiementController.createDecaissement);

router.route('/:id')
    .get(checkPermission('comptabilite:read'), paiementController.getPaiementById);


module.exports = router;