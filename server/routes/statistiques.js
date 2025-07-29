// ==============================================================================
//           Routeur pour les Ressources de Statistiques (/api/v1/statistiques)
//
// Ce fichier définit toutes les routes liées à la récupération de données
// agrégées, de KPIs et de rapports.
//
// Toutes les routes de ce module sont protégées et requièrent une permission
// spécifique (`read:rapport`), car elles exposent des données commerciales
// sensibles.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const statistiquesController = require('../controllers/commercial/statistiquesController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { sensitiveOperationLimiter } = require('../middleware/rateLimiter');


// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté.
router.use(authMiddleware);

// 2. L'utilisateur doit avoir la permission de lire les rapports.
router.use(checkPermission('read:rapport'));


// --- Définition des Routes de Statistiques ---

/**
 * @route   GET /api/v1/statistiques/kpis-commerciaux
 * @desc    Récupère les indicateurs clés de performance pour le tableau de bord.
 * @access  Privé (read:rapport)
 */
router.get(
    '/kpis-commerciaux',
    statistiquesController.getKpisCommerciaux
);

/**
 * @route   GET /api/v1/statistiques/ventes-annuelles
 * @desc    Récupère les données agrégées des ventes mensuelles sur 12 mois pour les graphiques.
 * @access  Privé (read:rapport)
 */
router.get(
    '/ventes-annuelles',
    // On peut appliquer un rate limiter plus strict pour les requêtes potentiellement lourdes.
    sensitiveOperationLimiter,
    statistiquesController.getVentesAnnuelles
);

// TODO: Ajouter d'autres routes pour des rapports plus spécifiques
// Exemple :
// router.get('/top-clients', statistiquesController.getTopClients);
// router.get('/top-produits', statistiquesController.getTopProduits);


// --- Exportation du Routeur ---
module.exports = router;