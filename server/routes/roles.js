// ==============================================================================
//           Routeur pour les Ressources Rôles (/api/v1/roles)
//
// Ce fichier définit toutes les routes liées à la gestion des rôles (RBAC).
// Ces routes sont hautement sensibles et ne doivent être accessibles qu'aux
// administrateurs ou aux utilisateurs ayant des permissions de gestion spécifiques.
//
// Il applique systématiquement les middlewares `authMiddleware` et `checkPermission`.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const roleController = require('../controllers/auth/roleController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
// Optionnel: middlewares de validation si vous en créez pour les rôles
// const { handleValidationErrors } = require('../middleware/validation');
// const { check } = require('express-validator');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. Appliquer l'authentification : l'utilisateur doit être connecté.
router.use(authMiddleware);

// 2. Appliquer la vérification des permissions : l'utilisateur doit avoir
//    le droit de gérer les rôles.
//    (Vous devez créer cette permission 'manage:roles' dans votre base de données)
router.use(checkPermission('manage:roles'));


// --- Définition des Routes CRUD pour les Rôles ---

// Routes pour la collection de rôles ( / )
router
  .route('/')
  .post(
    // Vous pourriez ajouter une validation ici
    // [ check('name').not().isEmpty() ],
    // handleValidationErrors,
    roleController.createRole
  )
  .get(roleController.getAllRoles);


// Routes pour un document rôle spécifique ( /:id )
router
  .route('/:id')
  .get(roleController.getRoleById)
  .patch(roleController.updateRole)
  .delete(roleController.deleteRole);


// --- Exportation du Routeur ---
module.exports = router;