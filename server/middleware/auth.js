// server/middleware/auth.js
// ==============================================================================
//           Middleware d'Authentification par Token JWT (Protect)
//
// Ce middleware est le principal gardien des routes protégées de l'API.
// Son rôle est de valider le token JWT et d'attacher l'utilisateur à la requête.
// ==============================================================================

const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../models/auth/User');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { getRolePermissions } = require('../services/auth/permissionService');


/**
 * Middleware pour protéger les routes.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;
  // 1) Récupérer le token de l'en-tête
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError("Vous n'êtes pas connecté. Veuillez fournir un token pour obtenir l'accès.", 401));
  }

  // 2) Vérifier et décoder le token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // 3) Vérifier si l'utilisateur existe toujours et est actif
  const currentUser = await User.findById(decoded.id).populate({
      path: 'role',
      select: 'name'
  });
  
  if (!currentUser) {
    return next(new AppError("L'utilisateur appartenant à ce token n'existe plus.", 401));
  }
  
  if (!currentUser.isActive) {
      return next(new AppError('Ce compte a été désactivé.', 401));
  }

  // 4) Vérifier si le mot de passe a été changé après l'émission du token
  if (currentUser.passwordChangedAfter(decoded.iat)) {
    return next(new AppError('Le mot de passe a été récemment changé. Veuillez vous reconnecter.', 401));
  }

  // 5) Attacher l'utilisateur à la requête
  // Pour plus d'efficacité, on peut pré-charger les permissions ici
  currentUser.permissions = await getRolePermissions(currentUser.role._id);
  req.user = currentUser;
  
  next();
});

module.exports = {
    protect
};