// server/routes/roles.js
// ==============================================================================
//           Routeur pour les Ressources Rôles (/api/v1/roles)
//
// Définit les routes pour la gestion des rôles (RBAC).
// Ces routes sont hautement sensibles et protégées par des permissions.
// ==============================================================================

const express = require('express');
const { body } = require('express-validator');

const roleController = require('../controllers/auth/roleController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { handleValidationErrors } = require('../middleware/validation');
const { USER_ROLES } = require('../utils/constants');

const router = express.Router();

// Appliquer le middleware `protect` et `checkPermission` à toutes les routes.
// Seuls les utilisateurs avec la permission 'role:manage' peuvent accéder à ce module.
router.use(protect);
router.use(checkPermission('role:manage'));

// --- Définition des Routes CRUD pour les Rôles ---

// Route spéciale pour récupérer toutes les permissions disponibles, groupées.
router.get('/permissions', roleController.getAllPermissions);

router.route('/')
  .post(
    [
      body('name').trim().notEmpty().withMessage('Le nom du rôle est obligatoire.')
        .isIn(Object.values(USER_ROLES)).withMessage('Le nom du rôle est invalide.'),
      body('description').optional().trim(),
      body('permissions').isArray().withMessage('Les permissions doivent être un tableau de noms de permission.'),
    ],
    handleValidationErrors,
    roleController.createRole
  )
  .get(roleController.getAllRoles);

router.route('/:id')
  .get(roleController.getRoleById)
  .patch(roleController.updateRole)
  .delete(roleController.deleteRole);

module.exports = router;