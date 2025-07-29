// ==============================================================================
//           Routeur pour la Consultation des Mouvements de Stock
//                 (/api/v1/stock/mouvements)
//
// Ce fichier définit les routes pour la lecture de l'historique et des
// rapports sur les mouvements de stock.
//
// Toutes les routes sont protégées et requièrent la permission de
// consulter les données de stock.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const mouvementController = require('../controllers/stock/mouvementController');
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
 * @route   GET /api/v1/stock/mouvements/rapport
 * @desc    Récupère un rapport agrégé sur les mouvements de stock sur une période.
 * @access  Privé (read:stock)
 */
router.get(
    '/rapport',
    mouvementController.getRapportMouvements
);


/**
 * @route   GET /api/v1/stock/mouvements/produit/:produitId
 * @desc    Récupère l'historique paginé des mouvements pour un produit spécifique.
 * @access  Privé (read:stock)
 */
router.get(
    '/produit/:produitId',
    mouvementController.getHistoriqueProduit
);


// --- Exportation du Routeur ---
module.exports = router;