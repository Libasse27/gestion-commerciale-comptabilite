// server/routes/auth.js
// ==============================================================================
//           Routeur pour l'Authentification (/api/v1/auth)
//
// Définit les routes pour l'inscription, la connexion, la déconnexion,
// et la gestion des mots de passe.
// ==============================================================================

const express = require('express');
const { body } = require('express-validator');

const authController = require('../controllers/auth/authController');
const { authLimiter } = require('../middleware/rateLimiter');
const { handleValidationErrors } = require('../middleware/validation');
const { protect } = require('../middleware/auth');
const { isStrongPassword } = require('../utils/validators');

const router = express.Router();

// --- ROUTES PUBLIQUES (protégées par un rate limiter strict) ---

router.post(
  '/register',
  authLimiter,
  [
    body('firstName', 'Le prénom est requis').trim().notEmpty(),
    body('lastName', 'Le nom de famille est requis').trim().notEmpty(),
    body('email', 'Veuillez fournir un email valide').isEmail().normalizeEmail(),
    body('password').custom((value) => {
      if (!isStrongPassword(value)) {
        throw new Error('Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial.');
      }
      return true;
    }),
  ],
  handleValidationErrors,
  authController.register
);

router.post(
    '/login', 
    authLimiter,
    [
        body('email', 'L\'email est requis.').notEmpty(),
        body('password', 'Le mot de passe est requis.').notEmpty(),
    ],
    handleValidationErrors,
    authController.login
);

router.post('/refresh-token', authController.refreshToken);

router.post(
    '/forgot-password', 
    authLimiter,
    [ body('email', 'Veuillez fournir un email valide').isEmail().normalizeEmail() ],
    handleValidationErrors,
    authController.forgotPassword
);

router.patch(
    '/reset-password/:token',
    authLimiter,
    [ body('password').custom((value) => {
        if (!isStrongPassword(value)) {
          throw new Error('Le nouveau mot de passe ne respecte pas les critères de sécurité.');
        }
        return true;
      })
    ],
    handleValidationErrors,
    authController.resetPassword
);

// --- ROUTES PRIVÉES (nécessitent d'être connecté) ---
router.use(protect); // Tout ce qui est en dessous est maintenant protégé

router.post('/logout', authController.logout);

router.patch(
    '/update-my-password',
    [
        body('currentPassword', 'Le mot de passe actuel est requis.').notEmpty(),
        body('newPassword').custom((value) => {
            if (!isStrongPassword(value)) {
              throw new Error('Le nouveau mot de passe ne respecte pas les critères de sécurité.');
            }
            return true;
          })
    ],
    handleValidationErrors,
    authController.updateMyPassword
);

module.exports = router;