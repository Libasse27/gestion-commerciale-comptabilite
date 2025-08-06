// server/routes/dashboard.js
const express = require('express');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// Importer les contrôleurs et sous-routeurs
const dashboardController = require('../controllers/dashboard/dashboardController');
const kpiRoutes = require('./dashboard/kpis');
const rapportRoutes = require('./dashboard/rapports');

const router = express.Router();

// Appliquer les middlewares d'authentification et de permission à toutes les routes du dashboard
router.use(protect);
router.use(checkPermission('dashboard:read'));

// Route principale pour les données agrégées du tableau de bord
router.get('/', dashboardController.getMainDashboardData);

// Brancher les sous-routeurs
router.use('/kpis', kpiRoutes);
router.use('/rapports', rapportRoutes);

module.exports = router;