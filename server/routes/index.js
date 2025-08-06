// server/routes/index.js
// ==============================================================================
//           Routeur Principal de l'API (/api/v1)
//
// Ce fichier est le point d'entrée unique pour toutes les routes de l'API.
// Il importe et monte tous les routeurs modulaires sur leurs préfixes respectifs.
// ==============================================================================

const express = require('express');

// --- Import de tous les routeurs modulaires ---
const authRoutes = require('./auth');
const userRoutes = require('./users');
const roleRoutes = require('./roles');
const clientRoutes = require('./clients');
const fournisseurRoutes = require('./fournisseurs');
const produitRoutes = require('./produits');
const ventesRoutes = require('./ventes');
const stockRoutes = require('./stock');
const paiementRoutes = require('./paiements');
const comptabiliteRoutes = require('./comptabilite');
const dashboardRoutes = require('./dashboard'); // Routeur pour le dashboard et les rapports
const systemRoutes = require('./system');

const router = express.Router();

// --- Route Système : Health Check ---
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});

// --- Montage des Routeurs ---
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/roles', roleRoutes);
router.use('/clients', clientRoutes);
router.use('/fournisseurs', fournisseurRoutes);
router.use('/produits', produitRoutes);
router.use('/ventes', ventesRoutes);
router.use('/stock', stockRoutes);
router.use('/paiements', paiementRoutes);
router.use('/comptabilite', comptabiliteRoutes);
router.use('/dashboard', dashboardRoutes); // Route unique pour tout ce qui est analytique
router.use('/system', systemRoutes);

module.exports = router;