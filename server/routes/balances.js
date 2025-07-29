// ==============================================================================
//           Sous-Routeur pour les Balances Comptables
//           (Préfixe: /api/v1/comptabilite/balances)
//
// Ce fichier définit les routes spécifiques à la génération des différentes
// balances comptables (générale, tiers, âgée, etc.).
//
// Toutes les routes sont protégées et potentiellement limitées en fréquence
// car la génération de balances peut être gourmande en ressources.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const balanceController = require('../controllers/comptabilite/balanceController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { sensitiveOperationLimiter } = require('../middleware/rateLimiter');

// --- Initialisation du Sous-Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté.
router.use(authMiddleware);

// 2. L'utilisateur doit avoir la permission de lire les données comptables.
router.use(checkPermission('read:comptabilite'));

// 3. Appliquer un rate limiter car la génération de balances peut être intensive.
router.use(sensitiveOperationLimiter);


// --- Définition des Routes ---

/**
 * @route   GET /api/v1/comptabilite/balances/generale
 * @desc    Génère la balance comptable générale sur une période.
 * @access  Privé (read:comptabilite)
 */
router.get(
    '/generale',
    balanceController.getBalanceGenerale
);


/**
 * @route   GET /api/v1/comptabilite/balances/tiers
 * @desc    Génère la balance des comptes Tiers (clients et fournisseurs).
 * @access  Privé (read:comptabilite)
 */
// router.get(
//     '/tiers',
//     balanceController.getBalanceTiers // À implémenter
// );


/**
 * @route   GET /api/v1/comptabilite/balances/agee
 * @desc    Génère la balance âgée des créances clients ou dettes fournisseurs.
 * @access  Privé (read:comptabilite)
 */
// router.get(
//     '/agee',
//     balanceController.getBalanceAgee // À implémenter
// );


// --- Exportation du Sous-Routeur ---
module.exports = router;