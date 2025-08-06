// server/routes/users.js
// ==============================================================================
//           Routeur pour les Ressources Utilisateurs (/api/v1/users)
//
// Définit les routes pour la gestion des utilisateurs par les administrateurs
// et pour la gestion du profil de l'utilisateur connecté.
// ==============================================================================

const express = require('express');
const { body } = require('express-validator');

const userController = require('../controllers/auth/userController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Appliquer le middleware `protect` à TOUTES les routes de ce fichier.
router.use(protect);

// --- Routes pour l'Utilisateur Connecté ---
router.get('/me', userController.getMe);
router.patch(
    '/updateMe',
    [
        body('email').optional().isEmail().withMessage('Email invalide').normalizeEmail(),
        body('firstName').optional().trim().notEmpty().withMessage('Le prénom ne peut être vide.'),
        body('lastName').optional().trim().notEmpty().withMessage('Le nom ne peut être vide.'),
    ],
    handleValidationErrors,
    userController.updateMe
);

// --- Routes pour l'Administration des Utilisateurs ---
// Les routes ci-dessous nécessitent des permissions spécifiques.

router.route('/')
    .get(checkPermission('user:read'), userController.getAllUsers)
    .post(
        checkPermission('user:create'),
        // Ajouter ici la validation pour la création d'utilisateur par un admin
        [
            body('firstName', 'Le prénom est requis').notEmpty(),
            body('lastName', 'Le nom de famille est requis').notEmpty(),
            body('email', 'Email invalide').isEmail(),
            body('role', 'Le rôle est requis').isMongoId(),
            // Le mot de passe sera probablement généré et envoyé par email,
            // mais on peut le rendre optionnel pour l'instant.
            body('password').optional(), 
        ],
        handleValidationErrors,
        userController.createUser
    );

router.route('/:id')
  .get(checkPermission('user:read'), userController.getUserById)
  .patch(checkPermission('user:update'), userController.updateUser)
  .delete(checkPermission('user:delete'), userController.deleteUser);


module.exports = router;