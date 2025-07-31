// ==============================================================================
//           Routeur pour les Rapports Analytiques (/api/v1/rapports)
//
// Ce fichier définit les routes pour la génération de rapports complexes
// (financiers, fiscaux, commerciaux).
//
// Toutes les routes sont protégées et requièrent des permissions spécifiques.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const rapportController = require('../controllers/dashboard/rapportController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { sensitiveOperationLimiter } = require('../middleware/rateLimiter');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté pour accéder à n'importe quel rapport.
router.use(authMiddleware);

// 2. Un rate limiter est appliqué à toutes les routes de rapport car elles
//    peuvent être gourmandes en ressources.
router.use(sensitiveOperationLimiter);


// --- Définition des Routes de Reporting ---

/**
 * @route   GET /api/v1/rapports/ventes
 * @desc    Génère un rapport de ventes détaillé sur une période.
 * @access  Privé (read:rapport)
 */
router.get(
    '/ventes',
    checkPermission('read:rapport'),
    rapportController.getRapportVentes
);


/**
 * @route   GET /api/v1/rapports/bilan
 * @desc    Génère le Bilan à une date de fin donnée.
 * @access  Privé (read:comptabilite)
 */
router.get(
    '/bilan',
    checkPermission('read:comptabilite'),
    rapportController.getBilan
);


/**
 * @route   GET /api/v1/rapports/balance-generale
 * @desc    Génère la balance comptable générale sur une période.
 * @access  Privé (read:comptabilite)
 */
// NOTE : Nous avons déplacé cette route vers /comptabilite/balances/generale.
// Elle est commentée ici pour éviter les doublons, mais laissée en exemple.

router.get(
    '/balance-generale',
    checkPermission('read:comptabilite'),
    rapportController.getBalanceGenerale
);


/**
 * @route   GET /api/v1/rapports/declaration-tva
 * @desc    Prépare la déclaration de TVA pour un mois/année donné.
 * @access  Privé (manage:comptabilite)
 */
router.get(
    '/declaration-tva',
    // Requiert une permission plus élevée car c'est une opération de gestion
    checkPermission('manage:comptabilite'),
    rapportController.getDeclarationTVA
);


// --- Exportation du Routeur ---
module.exports = router;