// ==============================================================================
//           Routeur pour l'Authentification (/api/v1/auth)
//
// Ce fichier définit toutes les routes liées au processus d'authentification
// et d'initialisation du système. Chaque route est protégée par les
// middlewares appropriés (limitation de taux, validation, authentification).
// ==============================================================================

const express = require('express');
const { body } = require('express-validator');

// --- Importation des Contrôleurs ---
const authController = require('../controllers/auth/authController');

// --- Importation des Middlewares ---
const { authLimiter } = require('../middleware/rateLimiter');
const { handleValidationErrors } = require('../middleware/validation');
const { protect } = require('../middleware/auth'); // Renommé pour la clarté
const { isStrongPassword } = require('../utils/validators');


// --- Initialisation du Routeur ---
const router = express.Router();


// ==================================================
// --- 1. ROUTE D'INITIALISATION DU SYSTÈME      ---
// ==================================================
// Route spéciale qui ne doit être appelée qu'une seule fois.
router.post(
    '/initialize',
    authLimiter, // Protège contre les abus sur cette route critique
    authController.initializeSystem // Le nom de la fonction a été mis à jour
);


// ==================================================
// --- 2. ROUTES PUBLIQUES (Authentification)     ---
// ==================================================

// Inscription d'un nouvel utilisateur
router.post(
  '/register',
  authLimiter, // Appliquer le limiteur ici aussi
  [
    body('firstName', 'Le prénom est requis').trim().not().isEmpty(),
    body('lastName', 'Le nom de famille est requis').trim().not().isEmpty(),
    body('email', 'Veuillez fournir un email valide').isEmail().normalizeEmail(),
    body('password')
      .custom(isStrongPassword)
      .withMessage('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.'),
  ],
  handleValidationErrors, // Gère les erreurs de la chaîne de validation ci-dessus
  authController.register
);

// Connexion
router.post('/login', authLimiter, authController.login);

// Rafraîchissement du token d'accès via le cookie httpOnly
router.post('/refresh-token', authController.refreshToken);

// Demande de réinitialisation de mot de passe
router.post('/forgot-password', authLimiter, authController.forgotPassword);

// Réinitialisation effective du mot de passe avec le token
router.patch('/reset-password/:token', authController.resetPassword);


// ==================================================
// --- 3. ROUTES PRIVÉES (Nécessitent une session) ---
// ==================================================

// Déconnexion
router.post('/logout', protect, authController.logout);


// --- Exportation du Routeur ---
module.exports = router;