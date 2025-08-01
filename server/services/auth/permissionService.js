// ==============================================================================
//                Service de Gestion des Rôles et Permissions (RBAC)
//
// Ce service gère la logique métier du Contrôle d'Accès Basé sur les Rôles.
// Il est responsable de :
//   - La création/gestion des permissions granulaires.
//   - La création/gestion des rôles.
//   - L'assignation de permissions à des rôles.
//   - La vérification des droits d'un utilisateur pour une action donnée.
//   - La mise en cache intensive des permissions pour des performances optimales.
// ==============================================================================

const Role = require('../../models/auth/Role');
const Permission = require('../../models/auth/Permission');
const User = require('../../models/auth/User');
const redisClient = require('../../config/redis'); // Pour la mise en cache
const { CACHE_TTL } = require('../../utils/constants');
const { logger } = require('../../middleware/logger');

/**
 * Crée une nouvelle permission si elle n'existe pas déjà.
 * @param {string} name - Le nom de la permission (ex: 'produit:create').
 * @param {string} description - Une description de ce que la permission autorise.
 * @param {string} group - Le groupe auquel la permission appartient (ex: 'Produits').
 * @returns {Promise<import('mongoose').Document>} La permission créée ou existante.
 */
async function createPermission(name, description, group) {
  const existingPermission = await Permission.findOne({ name });
  if (existingPermission) {
    return existingPermission;
  }
  const newPermission = new Permission({ name, description, group });
  await newPermission.save();
  return newPermission;
}

/**
 * Crée un nouveau rôle.
 * @param {string} name - Le nom du rôle (doit être dans USER_ROLES).
 * @param {string} description - La description du rôle.
 * @param {string[]} permissionNames - Un tableau des noms des permissions à associer.
 * @returns {Promise<import('mongoose').Document>} Le rôle créé.
 * @throws {Error} Si le rôle existe déjà ou si une permission n'est pas trouvée.
 */
async function createRole(name, description, permissionNames = []) {
  const existingRole = await Role.findOne({ name });
  if (existingRole) {
    throw new Error('Ce rôle existe déjà.');
  }

  const permissions = await Permission.find({ name: { $in: permissionNames } });
  if (permissions.length !== permissionNames.length) {
    throw new Error("Une ou plusieurs permissions spécifiées n'ont pas été trouvées.");
  }

  const newRole = new Role({
    name,
    description,
    permissions: permissions.map(p => p._id),
  });

  await newRole.save();
  await invalidateRolePermissionsCache(newRole._id); // Invalider le cache immédiatement
  return newRole;
}

/**
 * Récupère les permissions d'un rôle, en utilisant un cache Redis pour les performances.
 * @param {import('mongoose').Types.ObjectId} roleId - L'ID du rôle.
 * @returns {Promise<Set<string>>} Un Set contenant les noms des permissions pour ce rôle.
 */
async function getRolePermissions(roleId) {
  if (!roleId) return new Set();
  const cacheKey = `permissions:role:${roleId}`;

  try {
    // 1. Essayer de récupérer depuis le cache
    if (redisClient.isOpen) {
        const cachedPermissions = await redisClient.get(cacheKey);
        if (cachedPermissions) {
          return new Set(JSON.parse(cachedPermissions));
        }
    }

    // 2. Si cache miss, récupérer depuis la DB
    const role = await Role.findById(roleId).populate('permissions', 'name');
    if (!role) {
      return new Set(); // Retourne un Set vide si le rôle n'existe pas
    }

    const permissionsSet = new Set(role.permissions.map(p => p.name));

    // 3. Mettre en cache pour les futures requêtes
    if (redisClient.isOpen) {
        await redisClient.set(cacheKey, JSON.stringify([...permissionsSet]), {
          EX: CACHE_TTL.LONG, // Expire après 1 heure
        });
    }

    return permissionsSet;
  } catch (error) {
      logger.error('Erreur lors de la récupération des permissions du rôle.', { roleId, error: error.message });
      return new Set(); // Retourne un Set vide en cas d'erreur
  }
}

/**
 * Invalide (supprime) le cache des permissions pour un rôle donné.
 * À appeler chaque fois que les permissions d'un rôle sont modifiées.
 * @param {import('mongoose').Types.ObjectId} roleId - L'ID du rôle dont le cache doit être invalidé.
 */
async function invalidateRolePermissionsCache(roleId) {
  if (redisClient.isOpen) {
    const cacheKey = `permissions:role:${roleId}`;
    await redisClient.del(cacheKey);
  }
}

/**
 * Vérifie si un utilisateur a une permission spécifique.
 * @param {import('mongoose').Types.ObjectId} userId - L'ID de l'utilisateur.
 * @param {string} requiredPermission - Le nom de la permission requise.
 * @returns {Promise<boolean>} `true` si l'utilisateur a la permission, sinon `false`.
 */
async function userHasPermission(userId, requiredPermission) {
  const user = await User.findById(userId).select('role').lean(); // .lean() pour la performance
  if (!user || !user.role) {
    return false;
  }

  const userPermissions = await getRolePermissions(user.role);
  return userPermissions.has(requiredPermission);
}


module.exports = {
  createPermission,
  createRole,
  getRolePermissions,
  invalidateRolePermissionsCache,
  userHasPermission,
};