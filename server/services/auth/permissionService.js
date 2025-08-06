// server/services/auth/permissionService.js
// ==============================================================================
//                Service de Gestion des Rôles et Permissions (RBAC)
//
// Ce service gère la logique métier du Contrôle d'Accès Basé sur les Rôles.
// Il est responsable du cycle de vie complet des permissions et des rôles,
// et de la vérification des droits des utilisateurs.
// ==============================================================================

const Role = require('../../models/auth/Role');
const Permission = require('../../models/auth/Permission');
const User = require('../../models/auth/User');
const { redisClient } = require('../../config/redis'); // Importer le client
const { CACHE_TTL } = require('../../utils/constants');
const { logger } = require('../../middleware/logger');
const AppError = require('../../utils/appError');

/**
 * Crée ou met à jour une permission.
 * @param {{name: string, description: string, group: string}} permissionData
 */
async function createPermission({ name, description, group }) {
  return Permission.findOneAndUpdate({ name }, { name, description, group }, { upsert: true, new: true, runValidators: true });
}

/**
 * Crée un nouveau rôle.
 * @param {{name: string, description: string, permissionNames: string[]}} roleData
 */
async function createRole({ name, description, permissionNames = [] }) {
  if (await Role.findOne({ name })) {
    throw new AppError('Un rôle avec ce nom existe déjà.', 409);
  }

  const permissions = await Permission.find({ name: { $in: permissionNames } }).select('_id');
  if (permissions.length !== permissionNames.length) {
    throw new AppError("Une ou plusieurs permissions spécifiées n'ont pas été trouvées.", 400);
  }

  const newRole = await Role.create({
    name, description, permissions: permissions.map(p => p._id),
  });
  return newRole;
}

/**
 * Met à jour les permissions d'un rôle.
 * @param {string} roleId
 * @param {{description: string, permissionNames: string[]}} updateData
 */
async function updateRolePermissions(roleId, { description, permissionNames = [] }) {
  const role = await Role.findById(roleId);
  if (!role) throw new AppError('Rôle non trouvé.', 404);

  const permissions = await Permission.find({ name: { $in: permissionNames } }).select('_id');
  if (permissions.length !== permissionNames.length) {
    throw new AppError("Une ou plusieurs permissions spécifiées n'ont pas été trouvées.", 400);
  }

  role.description = description ?? role.description;
  role.permissions = permissions.map(p => p._id);
  
  await role.save();
  await invalidateRolePermissionsCache(roleId);
  return role;
}

/**
 * Supprime un rôle.
 * @param {string} roleId
 */
async function deleteRole(roleId) {
    const userCount = await User.countDocuments({ role: roleId });
    if (userCount > 0) {
        throw new AppError(`Impossible de supprimer ce rôle car il est assigné à ${userCount} utilisateur(s).`, 400);
    }
    const role = await Role.findByIdAndDelete(roleId);
    if (!role) throw new AppError('Rôle non trouvé.', 404);
    
    await invalidateRolePermissionsCache(roleId);
    return role;
}

/**
 * Récupère les permissions d'un rôle, en utilisant un cache Redis.
 * @param {string} roleId
 */
async function getRolePermissions(roleId) {
  if (!roleId) return new Set();
  const cacheKey = `permissions:role:${roleId}`;
  
  try {
    if (redisClient.isOpen) {
        const cached = await redisClient.get(cacheKey);
        if (cached) return new Set(JSON.parse(cached));
    }
  } catch(e) { logger.error('Erreur de lecture du cache Redis pour les permissions.', { error: e.message }); }

  const role = await Role.findById(roleId).populate('permissions', 'name').lean();
  if (!role || !role.permissions) return new Set();

  const permissionsSet = new Set(role.permissions.map(p => p.name));
  
  try {
    if (redisClient.isOpen) {
        await redisClient.set(cacheKey, JSON.stringify([...permissionsSet]), { EX: CACHE_TTL.LONG });
    }
  } catch(e) { logger.error('Erreur d\'écriture du cache Redis pour les permissions.', { error: e.message }); }

  return permissionsSet;
}

/**
 * Invalide (supprime) le cache des permissions pour un rôle donné.
 * @param {string} roleId
 */
async function invalidateRolePermissionsCache(roleId) {
    if (!roleId) return;
    if (redisClient.isOpen) {
        const cacheKey = `permissions:role:${roleId}`;
        await redisClient.del(cacheKey);
    }
}

/**
 * Vérifie si un utilisateur a une permission spécifique.
 * @param {string} userId
 * @param {string} requiredPermission
 */
async function userHasPermission(userId, requiredPermission) {
  const user = await User.findById(userId).select('role').lean();
  if (!user || !user.role) return false;

  const userPermissions = await getRolePermissions(user.role);
  return userPermissions.has(requiredPermission);
}


module.exports = {
  createPermission,
  createRole,
  updateRolePermissions,
  deleteRole,
  getRolePermissions,
  invalidateRolePermissionsCache,
  userHasPermission,
};