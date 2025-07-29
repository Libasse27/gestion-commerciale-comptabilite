// ==============================================================================
//           Routeur pour les Rapports Comptables et Fiscaux
//                    (/api/v1/rapports)
//
// Ce fichier définit les routes pour la génération des états financiers et
// des déclarations fiscales.
//
// Toutes les routes sont protégées et requièrent des permissions de lecture
// ou de gestion de la comptabilité.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const rapportController = require('../controllers/comptabilite/rapportController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { sensitiveOperationLimiter } = require('../middleware/rateLimiter');


// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté pour accéder à n'importe quel rapport.
router.use(authMiddleware);

// 2. Une permission de base est requise pour accéder à la section des rapports.
//    Des permissions plus spécifiques peuvent être ajoutées sur certaines routes.
router.use(checkPermission('read:comptabilite'));


// --- Définition des Routes de Reporting ---

/**
 * @route   GET /api/v1/rapports/balance-generale
 * @desc    Génère la balance comptable générale sur une période.
 * @access  Privé (read:comptabilite)
 */
router.get(
    '/balance-generale',
    // Les rapports pouvant être gourmands, on peut les limiter
    sensitiveOperationLimiter,
    rapportController.getBalanceGenerale
);


/**
 * @route   GET /api/v1/rapports/bilan
 * @desc    Génère le Bilan à une date de fin donnée.
 * @access  Privé (read:comptabilite)
 */
router.get(
    '/bilan',
    sensitiveOperationLimiter,
    rapportController.getBilan
);


/**
 * @route   GET /api/v1/rapports/compte-resultat
 * @desc    Génère le Compte de Résultat sur une période.
 * @access  Privé (read:comptabilite)
 */
router.get(
    '/compte-resultat',
    sensitiveOperationLimiter,
    rapportController.getCompteDeResultat
);


/**
 * @route   GET /api/v1/rapports/declaration-tva
 * @desc    Prépare la déclaration de TVA pour un mois/année donné.
 * @access  Privé (manage:comptabilite)
 */
router.get(
    '/declaration-tva',
    // On ajoute un check de permission plus strict pour cette route sensible
    checkPermission('manage:comptabilite'),
    rapportController.getDeclarationTVA
);


// --- Exportation du Routeur ---
module.exports = router;