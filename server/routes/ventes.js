// server/routes/ventes.js
const express = require('express');
const devisRoutes = require('./devis');
const commandeRoutes = require('./commandes');
const factureRoutes = require('./factures'); 

const router = express.Router();

router.use('/devis', devisRoutes);
router.use('/commandes', commandeRoutes);
router.use('/factures', factureRoutes); 

module.exports = router;