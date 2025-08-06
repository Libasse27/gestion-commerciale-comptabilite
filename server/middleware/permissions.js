// server/middleware/permissions.js
// ==============================================================================
//                Middleware de Vérification des Permissions (RBAC)
//
// Ce middleware utilise le `permissionService` pour vérifier si un utilisateur
// authentifié a le droit d'effectuer une action spécifique.
// Il doit être utilisé APRES le middleware `protect`.
// ==============================================================================

const permissionService = require('../services/auth/permissionService');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Factory qui crée un middleware pour vérifier si un utilisateur a une permission spécifique.
 * @param {string} requiredPermission - Le nom de la permission (ex: 'client:create').
 * @returns {function} Le middleware Express.
 */
const checkPermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.id) {
      return next(new AppError('Utilisateur non authentifié. Impossible de vérifier les permissions.', 500));
    }

    const hasPermission = await permissionService.userHasPermission(req.user.id, requiredPermission);

    if (hasPermission) {
      return next();
    } else {
      return next(new AppError("Accès interdit. Vous n'avez pas les permissions requises pour effectuer cette action.", 403));
    }
  });
};

/**
 * Factory qui crée un middleware pour vérifier si un utilisateur a AU MOINS UNE des permissions listées.
 * @param {string[]} requiredPermissions - Un tableau de noms de permissions.
 * @returns {function} Le middleware Express.
 */
const checkAnyPermission = (requiredPermissions) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) {
      return next(new AppError('Utilisateur ou rôle non authentifié. Impossible de vérifier les permissions.', 500));
    }

    const userPermissions = await permissionService.getRolePermissions(req.user.role._id || req.user.role);
    const hasAnyPermission = requiredPermissions.some(p => userPermissions.has(p));

    if (hasAnyPermission) {
      return next();
    } else {
      return next(new AppError("Accès interdit. Vous n'avez pas les permissions requises pour effectuer cette action.", 403));
    }
  });
};

module.exports = {
  checkPermission,
  checkAnyPermission,
};