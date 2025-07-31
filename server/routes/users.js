// ==============================================================================
//           Routeur pour les Ressources Utilisateurs (/api/v1/users)
//
// Ce fichier définit toutes les routes liées à la gestion des utilisateurs.
// Il met en œuvre une sécurité à plusieurs niveaux :
//   1. `protect` : S'assure que l'utilisateur est connecté pour toutes
//      les routes définies dans ce fichier.
//   2. `checkPermission` : Restreint l'accès aux opérations CRUD
//      (lister, créer, modifier, supprimer) aux seuls utilisateurs ayant
//      les permissions appropriées (ex: 'user:create', 'user:read:all').
// ==============================================================================

const express = require('express');
const { body } = require('express-validator');

// --- Importation des Contrôleurs ---
const userController = require('../controllers/auth/userController');
// La mise à jour de mot de passe est dans authController
const authController = require('../controllers/auth/authController');

// --- Importation des Middlewares ---
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { handleValidationErrors } = require('../middleware/validation');


// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Le middleware `protect` sera appliqué à TOUTES les routes définies
// ci-dessous. Aucune route dans ce fichier n'est accessible à un visiteur.
router.use(protect);


// ==============================================================
// --- Routes pour l'Utilisateur Connecté (son propre profil) ---
// ==============================================================

// Accessible à tout utilisateur connecté.
router.get('/me', userController.getMe);

// L'utilisateur met à jour ses propres informations (nom, email).
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

// L'utilisateur met à jour son propre mot de passe.
// La logique est dans `authController` car elle est liée à l'authentification.
// La route est `/auth/updateMyPassword` pour la cohérence. (À créer dans auth.js)


// ==============================================================
// --- Routes pour l'Administration des Utilisateurs (CRUD)   ---
// ==============================================================

// Lister tous les utilisateurs
router.get(
    '/',
    checkPermission('user:read:all'),
    userController.getAllUsers
);

// Créer un nouvel utilisateur
router.post(
    '/',
    checkPermission('user:create'),
    userController.createUser
);

// Appliquer le middleware checkPermission à toutes les routes qui suivent avec un paramètre :id
// Cela évite de le répéter pour get, patch et delete.
// router.use('/:id', checkPermission('user:manage')); // Exemple si on a une permission générique

// Opérations sur un utilisateur spécifique par son ID
router
  .route('/:id')
  .get(
    checkPermission('user:read'),
    userController.getUserById
  )
  .patch(
    checkPermission('user:update'),
    userController.updateUser
  )
  .delete(
    checkPermission('user:delete'),
    userController.deleteUser
  );


// --- Exportation du Routeur ---
module.exports = router;