// ==============================================================================
//           Routeur pour la Consultation du Journal d'Audit
//           (Préfixe: /api/v1/system/audit-logs)
//
// Ce fichier définit la route pour la consultation du journal d'audit.
//
// L'accès à ce module est hautement restreint et nécessite des permissions
// de niveau administrateur.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const auditLogController = require('../controllers/system/auditLogController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté.
router.use(authMiddleware);

// 2. L'utilisateur doit avoir une permission de haut niveau pour consulter les logs.
//    `manage:settings` est une bonne permission pour ce cas d'usage, car la
//    consultation des logs est une tâche d'administration système.
//    Vous pourriez aussi créer une permission dédiée comme `read:audit-logs`.
router.use(checkPermission('manage:settings'));


// --- Définition de la Route ---

/**
 * @route   GET /api/v1/system/audit-logs
 * @desc    Récupère les entrées du journal d'audit avec filtres et pagination.
 * @access  Privé (manage:settings)
 */
router.get(
    '/',
    auditLogController.getAllAuditLogs
);


// --- Exportation du Routeur ---
module.exports = router;