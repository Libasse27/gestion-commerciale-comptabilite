// ==============================================================================
//           Routeur pour les Indicateurs de Performance Clés (KPIs)
//                     (/api/v1/kpis)
//
// Ce fichier définit les routes pour récupérer des KPIs spécifiques.
// Chaque route correspond à un groupe de métriques thématiques (commercial,
// trésorerie, etc.).
//
// L'accès à ces routes est restreint aux utilisateurs authentifiés avec les
// permissions appropriées.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const kpiController = require('../controllers/dashboard/kpiController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté.
router.use(authMiddleware);

// 2. L'utilisateur doit avoir la permission de base pour lire les rapports/données agrégées.
router.use(checkPermission('read:rapport'));


// --- Définition des Routes ---

/**
 * @route   GET /api/v1/kpis/commerciaux
 * @desc    Récupère les KPIs liés à l'activité commerciale (CA du jour, etc.).
 * @access  Privé (read:rapport)
 */
router.get(
    '/commerciaux',
    kpiController.getKpisCommerciaux
);


/**
 * @route   GET /api/v1/kpis/tresorerie
 * @desc    Récupère les KPIs liés à la trésorerie (solde actuel, prévisionnel).
 * @access  Privé (read:rapport)
 */
router.get(
    '/tresorerie',
    kpiController.getKpisTresorerie
);


// --- Exportation du Routeur ---
module.exports = router;