// ==============================================================================
//           Routeur pour les Ressources Utilisateurs (/api/v1/users)
//
// Ce fichier définit toutes les routes liées à la gestion des utilisateurs.
// Il met en œuvre une sécurité à plusieurs niveaux :
//   1. `authMiddleware` : S'assure que l'utilisateur est connecté pour toutes
//      les routes définies dans ce fichier.
//   2. `checkPermission` : Restreint l'accès aux opérations CRUD
//      (lister, créer, modifier, supprimer) aux seuls utilisateurs ayant
//      la permission 'manage:users' (généralement les administrateurs).
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs ---
const userController = require('../controllers/auth/userController');
// `authController` est nécessaire pour la mise à jour du mot de passe
// const authController = require('../controllers/auth/authController');

// --- Importation des Middlewares ---
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Le middleware `authMiddleware` sera appliqué à TOUTES les routes définies
// ci-dessous. Aucune route dans ce fichier n'est accessible à un visiteur.
router.use(authMiddleware);


// --- Routes pour l'Utilisateur Connecté (sur son propre profil) ---

// Route pour obtenir les informations du profil de l'utilisateur actuellement connecté
// Accessible à tout utilisateur connecté.
router.get('/me', userController.getMe);

// Route pour que l'utilisateur mette à jour ses propres informations (nom, email, etc.)
router.patch('/updateMe', userController.updateMe);

// Route pour que l'utilisateur mette à jour son propre mot de passe
// La logique serait dans `authController` car elle est liée à l'authentification.
// router.patch('/updateMyPassword', authController.updatePassword);


// --- Routes pour l'Administration des Utilisateurs (CRUD) ---

// Le middleware `checkPermission` est appliqué au reste des routes.
// Seul un utilisateur avec la permission 'manage:users' (ex: Admin)
// pourra accéder aux endpoints suivants.
router.use(checkPermission('manage:users'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUserById)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);


// --- Exportation du Routeur ---
module.exports = router;