// ==============================================================================
//           Routeur pour les Données des Tableaux de Bord (/api/v1/dashboard)
// ==============================================================================
//
// Ce fichier définit les routes pour récupérer les données agrégées
// nécessaires à l'affichage des tableaux de bord (principal, commercial, etc.).
//
// Toutes les routes sont protégées par une authentification.
//
// ==============================================================================

const express = require('express');
const router = express.Router();

// --- Middlewares & Contrôleurs ---
const dashboardController = require('../controllers/dashboard/dashboardController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Middleware global : Authentification requise pour toutes les routes ---
router.use(authMiddleware);

// -----------------------------------------------------------------------------
// @route   GET /api/v1/dashboard/main
// @desc    Données principales pour le tableau de bord global
// @access  Privé
// -----------------------------------------------------------------------------
router.get(
  '/main',
  checkPermission('read:rapport'), // Optionnel selon la politique d'accès
  dashboardController.getMainDashboardData
);

// -----------------------------------------------------------------------------
// @route   GET /api/v1/dashboard/commercial
// @desc    Données spécifiques à un utilisateur commercial (à implémenter)
// @access  Privé
// -----------------------------------------------------------------------------
// router.get(
//   '/commercial',
//   // checkPermission('read:vente'),
//   dashboardController.getCommercialDashboardData
// );

// -----------------------------------------------------------------------------
// Export du routeur
// -----------------------------------------------------------------------------
module.exports = router;
