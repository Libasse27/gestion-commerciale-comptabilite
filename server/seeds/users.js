// server/seeds/users.js
const User = require('../models/auth/User');
const Role = require('../models/auth/Role');
const { logger } = require('../middleware/logger');

const usersData = [
  { firstName: 'Admin', lastName: 'Principal', email: 'admin@erp.sn', password: 'Password123!', roleName: 'Admin', isActive: true },
  { firstName: 'Jean', lastName: 'Comptable', email: 'comptable@erp.sn', password: 'Password123!', roleName: 'Comptable', isActive: true },
  { firstName: 'Awa', lastName: 'Commerciale', email: 'commercial@erp.sn', password: 'Password123!', roleName: 'Commercial', isActive: true },
  { firstName: 'Moussa', lastName: 'Vendeur', email: 'vendeur@erp.sn', password: 'Password123!', roleName: 'Vendeur', isActive: true },
];

const seedUsers = async (clean = true) => {
  if (clean) {
    await User.deleteMany({});
    logger.info('Collection "users" nettoyée.');
  }

  try {
    const roles = await Role.find({}).lean();
    if (roles.length === 0) {
      throw new Error("Aucun rôle trouvé. Veuillez d'abord amorcer les rôles.");
    }

    const roleMap = roles.reduce((map, role) => ({ ...map, [role.name]: role._id }), {});
    
    let createdCount = 0;
    for (const userData of usersData) {
      const roleId = roleMap[userData.roleName];
      if (!roleId) {
        logger.warn(`Rôle "${userData.roleName}" non trouvé pour l'utilisateur "${userData.email}". Il sera ignoré.`);
        continue;
      }

      // Utiliser User.create() DÉCLENCHE les hooks pre('save')
      await User.create({
        ...userData,
        role: roleId,
      });
      createdCount++;
    }

    if (createdCount > 0) {
        logger.info(`✅ ${createdCount} utilisateurs ont été créés (avec mots de passe hachés).`);
    }

  } catch (error) {
    if (error.code === 11000) {
        logger.warn('Certains utilisateurs existaient déjà. Opération terminée.');
    } else {
        logger.error('❌ Erreur lors de l\'amorçage des utilisateurs :', error);
        throw error;
    }
  }
};

module.exports = seedUsers;