// ==============================================================================
//                Middleware de Vérification des Permissions (RBAC)
//
// Ce middleware utilise le `permissionService` pour vérifier si un utilisateur
// authentifié a le droit d'effectuer une action spécifique.
//
// Il est conçu pour être utilisé DANS les routes, APRES le middleware
// d'authentification (`auth.js`), qui est chargé de valider le token JWT et
// d'attacher l'objet `user` à la requête.
//
// Usage:
//   router.get('/ressource', authMiddleware, checkPermission('read:ressource'), controller);
// ==============================================================================

// Note : Ce middleware dépend d'un service qui n'est pas encore créé.
// Nous allons créer `permissionService` dans les étapes suivantes.
const permissionService = require('../services/auth/permissionService');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

/**
 * Factory de middleware qui vérifie si un utilisateur a une permission spécifique.
 * @param {string} requiredPermission - Le nom de la permission requise (ex: 'create:produit').
 * @returns {function} Le middleware Express prêt à l'emploi.
 */
const checkPermission = (requiredPermission) => {
  return asyncHandler(async (req, res, next) => {
    // Étape 1: Vérifier si le middleware d'authentification a bien été exécuté avant.
    // L'objet `req.user` doit être présent et contenir l'ID de l'utilisateur.
    if (!req.user || !req.user.id) {
      // Cette erreur ne devrait pas se produire si l'ordre des middlewares est correct.
      // C'est une erreur de configuration serveur, donc une erreur 500.
      return next(new AppError('Utilisateur non authentifié. Impossible de vérifier les permissions.', 500));
    }

    // Étape 2: Utiliser le service pour vérifier la permission.
    const hasPermission = await permissionService.userHasPermission(req.user.id, requiredPermission);

    // Étape 3: Gérer le résultat.
    if (hasPermission) {
      // L'utilisateur a la permission, on passe au prochain middleware (souvent le contrôleur).
      return next();
    } else {
      // L'utilisateur est bien authentifié mais n'a pas les droits nécessaires.
      // C'est une erreur 403 Forbidden (Accès Interdit).
      return next(new AppError("Accès interdit. Vous n'avez pas les permissions requises pour effectuer cette action.", 403));
    }
  });
};

/**
 * Factory de middleware qui vérifie si un utilisateur a AU MOINS UNE des permissions listées.
 * @param {string[]} requiredPermissions - Un tableau de noms de permissions.
 * @returns {function} Le middleware Express.
 */
const checkAnyPermission = (requiredPermissions) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.user.role) { // On vérifie ici la présence du rôle
      return next(new AppError('Utilisateur ou rôle non-authentifié. Impossible de vérifier les permissions.', 500));
    }

    // Récupère toutes les permissions du rôle de l'utilisateur une seule fois.
    const userPermissions = await permissionService.getRolePermissions(req.user.role);
    
    // Vérifie si l'utilisateur a au moins une des permissions requises.
    const hasAnyPermission = requiredPermissions.some(p => userPermissions.has(p));

    if (hasAnyPermission) {
      return next();
    } else {
      return next(new AppError('Accès interdit. Permissions insuffisantes.', 403));
    }
  });
};

module.exports = {
  checkPermission,
  checkAnyPermission,
};