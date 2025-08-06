const express = require('express');
const mobileMoneyController = require('../../controllers/paiements/mobileMoneyController');

const router = express.Router();

// Note : La route d'initiation sera protégée, mais le webhook est public.
router.post('/initiate-wave', mobileMoneyController.initiateWavePayment);
// La route du webhook elle-même ne doit PAS avoir le middleware `protect`
// car elle est appelée par un serveur externe.
// Sa sécurité est assurée par la vérification de signature.

module.exports = router;