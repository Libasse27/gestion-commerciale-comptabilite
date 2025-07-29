// ==============================================================================
//           Routeur pour la Consultation de l'État du Stock
//                     (/api/v1/stock)
//
// Ce fichier définit les routes pour la lecture de l'état actuel du stock.
// Toutes les routes sont en lecture seule (GET) et requièrent la permission
// de consulter les données de stock.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const stockController = require('../controllers/stock/stockController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté.
router.use(authMiddleware);

// 2. L'utilisateur doit avoir la permission de base pour lire les informations de stock.
router.use(checkPermission('read:stock'));


// --- Définition des Routes ---

/**
 * @route   GET /api/v1/stock/etats
 * @desc    Récupère l'état global du stock pour tous les produits et dépôts.
 * @access  Privé (read:stock)
 */
router.get(
    '/etats',
    stockController.getEtatStockGlobal
);


/**
 * @route   GET /api/v1/stock/etats/produit/:produitId
 * @desc    Récupère les niveaux de stock pour un produit spécifique dans tous les dépôts.
 * @access  Privé (read:stock)
 */
router.get(
    '/etats/produit/:produitId',
    stockController.getStockParProduit
);


/**
 * @route   GET /api/v1/stock/etats/level?produitId=...&depotId=...
 * @desc    Récupère la quantité exacte pour une combinaison produit/dépôt.
 * @access  Privé (read:stock)
 */
router.get(
    '/etats/level',
    stockController.getStockLevel
);


// --- Exportation du Routeur ---
module.exports = router;