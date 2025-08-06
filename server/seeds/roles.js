// server/seeds/roles.js
const Role = require('../models/auth/Role');
const Permission = require('../models/auth/Permission');
const { USER_ROLES } = require('../utils/constants');
const { logger } = require('../middleware/logger');

/**
 * Récupère les permissions de la DB et les mappe par nom.
 */
const getPermissionsMap = async () => {
  const permissions = await Permission.find({}).lean();
  if (permissions.length === 0) {
    throw new Error("Aucune permission trouvée. Veuillez d'abord amorcer les permissions.");
  }
  return permissions.reduce((acc, p) => ({ ...acc, [p.name]: p._id }), {});
};

/**
 * Construit la liste des IDs de permissions pour un rôle.
 */
const buildPermissionsList = (permissionNames, allPermissionsMap) => {
  return permissionNames
    .map(name => {
      const permissionId = allPermissionsMap[name];
      if (!permissionId) {
        logger.warn(`Permission non trouvée lors du seeding des rôles : '${name}'`);
      }
      return permissionId;
    })
    .filter(Boolean); // Filtre les IDs non trouvés (undefined)
};

/**
 * Amorce les rôles dans la base de données.
 */
const seedRoles = async (clean = true) => {
  if (clean) {
    await Role.deleteMany({});
    logger.info('Collection "roles" nettoyée.');
  }

  try {
    const allPermissionsMap = await getPermissionsMap();

    const rolesData = [
      {
        name: USER_ROLES.ADMIN,
        description: 'Accès total à l\'application.',
        permissions: Object.values(allPermissionsMap),
      },
      {
        name: USER_ROLES.COMPTABLE,
        description: 'Gère la facturation et la comptabilité.',
        permissions: buildPermissionsList(
          ['client:read', 'invoice:create', 'invoice:read', 'invoice:update', 'payment:create'],
          allPermissionsMap
        ),
      },
      {
        name: USER_ROLES.COMMERCIAL,
        description: 'Gère les clients et le cycle de vente.',
        permissions: buildPermissionsList(
          ['client:create', 'client:read', 'client:update', 'invoice:create', 'invoice:read:own'],
          allPermissionsMap
        ),
      },
      {
        name: USER_ROLES.VENDEUR,
        description: 'Accès limité à la création de documents de vente.',
        permissions: buildPermissionsList(
          ['client:create', 'invoice:create', 'invoice:read:own'],
          allPermissionsMap
        ),
      },
    ];

    if (rolesData.length > 0) {
        await Role.insertMany(rolesData, { ordered: false });
        logger.info(`✅ ${rolesData.length} rôles ont été créés.`);
    }

  } catch (error) {
    if (error.code !== 11000) { // Ignorer les erreurs de duplicata
      logger.error('❌ Erreur lors de l\'amorçage des rôles :', error);
      throw error;
    }
  }
};

module.exports = seedRoles;