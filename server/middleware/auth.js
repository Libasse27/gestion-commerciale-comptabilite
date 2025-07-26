// ==============================================================================
//           Middleware d'Authentification par Token JWT
//
// Ce middleware est le principal gardien des routes protégées de l'API.
// Son rôle est de :
//   1. Extraire le token JWT de l'en-tête 'Authorization' de la requête.
//   2. Vérifier la validité et la signature du token.
//   3. Décoder le token pour obtenir l'ID de l'utilisateur.
//   4. Récupérer l'utilisateur correspondant dans la base de données.
//   5. Vérifier que l'utilisateur existe toujours et que son mot de passe
//      n'a pas été changé depuis l'émission du token.
//   6. Attacher l'objet utilisateur complet à la requête (`req.user`) pour
//      une utilisation par les middlewares et contrôleurs suivants.
//
// S'il échoue à l'une de ces étapes, il bloque la requête et renvoie une
// erreur d'authentification (401).
// ==============================================================================

const { promisify } = require('util'); // Pour transformer jwt.verify en une fonction à base de promesse
const jwt = require('jsonwebtoken');
const User = require('../models/auth/User');
const AppError = require('../utils/appError');
const { logger } = require('./logger');

/**
 * Middleware pour protéger les routes.
 */
const protect = async (req, res, next) => {
  try {
    // 1) Récupérer le token et vérifier s'il existe
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('Vous n\'êtes pas connecté. Veuillez fournir un token pour obtenir l\'accès.', 401));
    }

    // 2) Vérifier et décoder le token
    // jwt.verify peut être asynchrone, on le "promisify" pour utiliser async/await
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

    // 3) Vérifier si l'utilisateur existe toujours
    const currentUser = await User.findById(decoded.id).populate('role');
    if (!currentUser) {
      return next(new AppError('L\'utilisateur appartenant à ce token n\'existe plus.', 401));
    }

    // 4) Vérifier si l'utilisateur a changé son mot de passe après l'émission du token
    if (currentUser.passwordChangedAfter(decoded.iat)) {
      return next(new AppError('Le mot de passe a été récemment changé. Veuillez vous reconnecter.', 401));
    }
    
    // 5) Vérifier si le compte est actif
    if (!currentUser.isActive) {
        return next(new AppError('Ce compte a été désactivé.', 401));
    }

    // --- ACCÈS ACCORDÉ ---
    // Attacher l'utilisateur à la requête pour les middlewares/contrôleurs suivants
    req.user = currentUser;
    next();

  } catch (err) {
    // Gère les erreurs de jwt.verify (token expiré, signature invalide)
    if (err.name === 'JsonWebTokenError') {
        return next(new AppError('Token invalide. Authentification échouée.', 401));
    }
    if (err.name === 'TokenExpiredError') {
        return next(new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401));
    }
    // Pour les autres erreurs
    logger.error('Erreur inattendue dans le middleware d\'authentification', { error: err });
    return next(new AppError('Une erreur est survenue lors de l\'authentification.', 500));
  }
};

module.exports = protect;