// ==============================================================================
//           Routeur pour l'Authentification (/api/v1/auth)
//
// Ce fichier définit toutes les routes liées au processus d'authentification
// et d'initialisation du système.
// ==============================================================================

const express = require('express');
const { check } = require('express-validator');

// --- Importation des Contrôleurs ---
const authController = require('../controllers/auth/authController');

// --- Importation des Middlewares ---
const { authLimiter } = require('../middleware/rateLimiter');
const { handleValidationErrors } = require('../middleware/validation');
const { isStrongPassword } = require('../utils/validators');
const authMiddleware = require('../middleware/auth');


// --- Initialisation du Routeur ---
const router = express.Router();


// --- Route d'Initialisation du Système ---
// Cette route est spéciale et ne doit être appelée qu'une seule fois.
// Elle crée les rôles de base et le premier utilisateur administrateur.
router.post(
    '/initialize',
    // On pourrait ajouter un rate limiter très strict ici aussi
    authLimiter,
    authController.initializeAdmin
);


// --- Routes Publiques (avec limitation de taux) ---

// Route d'inscription pour les utilisateurs standards (ex: Vendeurs)
router.post(
  '/register',
  [
    check('firstName', 'Le prénom est requis').not().isEmpty(),
    check('lastName', 'Le nom de famille est requis').not().isEmpty(),
    check('email', 'Veuillez fournir un email valide').isEmail(),
    check('password')
      .custom(isStrongPassword)
      .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'),
  ],
  handleValidationErrors,
  authController.register
);

// Route de connexion
router.post('/login', authLimiter, authController.login);

// Route pour rafraîchir le token d'accès
router.post('/refresh-token', authController.refreshToken);

// Route pour la demande de réinitialisation de mot de passe
router.post('/forgot-password', authLimiter, authController.forgotPassword);

// Route pour la réinitialisation effective du mot de passe
router.patch('/reset-password/:token', authController.resetPassword);


// --- Route Privée ---

// Route de déconnexion
router.post('/logout', authMiddleware, authController.logout);


// --- Exportation du Routeur ---
module.exports = router;