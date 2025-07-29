// ==============================================================================
//           Routeur pour la Gestion des Sauvegardes
//           (Préfixe: /api/v1/system/backups)
//
// Ce fichier définit les routes pour la gestion des sauvegardes de la base de
// données.
//
// L'accès à ce module est hautement restreint et nécessite des permissions
// de niveau administrateur.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const backupController = require('../controllers/system/backupController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté.
router.use(authMiddleware);

// 2. L'utilisateur doit avoir une permission de haut niveau.
//    `manage:settings` est une bonne candidate pour regrouper des actions
//    d'administration système comme celle-ci.
router.use(checkPermission('manage:settings'));


// --- Définition des Routes ---

/**
 * @route   POST /api/v1/system/backups/trigger
 * @desc    Déclenche une sauvegarde manuelle en arrière-plan.
 * @access  Privé (manage:settings)
 */
router.post(
    '/trigger',
    backupController.triggerBackup
);


/**
 * @route   GET /api/v1/system/backups
 * @desc    Récupère l'historique de toutes les sauvegardes.
 * @access  Privé (manage:settings)
 */
/* router.get(
    '/',
    backupController.getBackups
);*/


/**
 * @route   GET /api/v1/system/backups/:id/download
 * @desc    Télécharge un fichier de sauvegarde spécifique.
 * @access  Privé (manage:settings)
 */
router.get(
    '/:id/download',
    backupController.downloadBackup
);


// --- Exportation du Routeur ---
module.exports = router;