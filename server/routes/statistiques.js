// ==============================================================================
// Routeur pour les ressources de statistiques (/api/v1/statistiques)
//
// MISE À JOUR : Ajout d'une route pour récupérer les KPIs d'un client spécifique.
// ==============================================================================

const express = require('express');

// --- Importation des contrôleurs et middlewares ---
const statistiquesController = require('../controllers/commercial/statistiquesController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { sensitiveOperationLimiter } = require('../middleware/rateLimiter');

// --- Initialisation du routeur ---
const router = express.Router();

// --- Middleware de sécurité global appliqué à toutes les routes ---
router.use(authMiddleware);

// La permission de base pour lire les rapports/statistiques
router.use(checkPermission('read:rapport'));

// --- Définition des routes ---

/**
 * @route   GET /api/v1/statistiques/kpis-commerciaux
 * @desc    Récupère les KPIs globaux pour le tableau de bord principal.
 * @access  Privé (permission read:rapport requise)
 */
router.get('/kpis-commerciaux', statistiquesController.getKpisCommerciaux);

/**
 * @route   GET /api/v1/statistiques/ventes-annuelles
 * @desc    Récupère les données pour le graphique des ventes sur 12 mois.
 * @access  Privé (permission read:rapport requise)
 * @middleware Rate limiter pour protéger les opérations lourdes
 */
router.get(
  '/ventes-annuelles',
  sensitiveOperationLimiter,
  statistiquesController.getVentesAnnuelles
);

/**
 * @route   GET /api/v1/statistiques/client/:clientId
 * @desc    Récupère les KPIs pour un client spécifique.
 * @access  Privé (permission read:rapport ou read:client requise)
 */
router.get('/client/:clientId', statistiquesController.getKpisForClient);

// --- Exportation du routeur ---
module.exports = router;
