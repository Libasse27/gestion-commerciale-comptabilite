// server/seeds/permissions.js
const Permission = require('../models/auth/Permission');
const Role = require('../models/auth/Role');
const { USER_ROLES } = require('../utils/constants');
const { logger } = require('../middleware/logger');

const permissionsData = [
  // AUTH & USERS
  { name: 'user:create', description: 'Créer un utilisateur', group: 'Utilisateurs' },
  { name: 'user:read', description: 'Voir les utilisateurs', group: 'Utilisateurs' },
  { name: 'user:update', description: 'Modifier un utilisateur', group: 'Utilisateurs' },
  { name: 'user:delete', description: 'Désactiver un utilisateur', group: 'Utilisateurs' },
  { name: 'role:manage', description: 'Gérer les rôles et permissions', group: 'Rôles' },
  
  // COMMERCIAL
  { name: 'client:create', description: 'Créer un client', group: 'Clients' },
  { name: 'client:read', description: 'Voir les clients', group: 'Clients' },
  { name: 'client:update', description: 'Modifier un client', group: 'Clients' },
  { name: 'client:delete', description: 'Désactiver un client', group: 'Clients' },
  { name: 'fournisseur:create', description: 'Créer un fournisseur', group: 'Fournisseurs' },
  { name: 'fournisseur:read', description: 'Voir les fournisseurs', group: 'Fournisseurs' },
  { name: 'fournisseur:update', description: 'Modifier un fournisseur', group: 'Fournisseurs' },
  { name: 'fournisseur:delete', description: 'Désactiver un fournisseur', group: 'Fournisseurs' },
  { name: 'produit:read', description: 'Voir le catalogue de produits', group: 'Catalogue' },
  { name: 'produit:manage', description: 'Gérer le catalogue de produits', group: 'Catalogue' },

  // VENTES
  { name: 'vente:create', description: 'Créer devis, commandes, factures', group: 'Ventes' },
  { name: 'vente:read', description: 'Voir tous les documents de vente', group: 'Ventes' },
  { name: 'vente:update', description: 'Modifier les documents de vente', group: 'Ventes' },
  { name: 'vente:delete', description: 'Annuler les documents de vente', group: 'Ventes' },
  { name: 'vente:validate', description: 'Valider et comptabiliser les factures', group: 'Ventes' },

  // PAIEMENTS
  { name: 'paiement:manage', description: 'Gérer les paiements entrants et sortants', group: 'Paiements' },
  
  // STOCK
  { name: 'stock:read', description: 'Consulter l\'état des stocks', group: 'Stock' },
  { name: 'stock:manage', description: 'Gérer les dépôts et les inventaires', group: 'Stock' },

  // COMPTABILITÉ & RAPPORTS
  { name: 'comptabilite:read', description: 'Consulter les données comptables et les rapports', group: 'Comptabilité' },
  { name: 'comptabilite:manage', description: 'Gérer les écritures et le plan comptable', group: 'Comptabilité' },
  { name: 'dashboard:read', description: 'Accéder aux tableaux de bord', group: 'Dashboard' },

  // SYSTÈME
  { name: 'system:read', description: 'Consulter les logs du système', group: 'Système' },
  { name: 'system:manage', description: 'Gérer les paramètres et les sauvegardes', group: 'Système' },
];

const rolesConfig = [
  {
    name: USER_ROLES.ADMIN,
    description: 'Accès total à toutes les fonctionnalités.',
    permissions: 'all',
  },
  {
    name: USER_ROLES.COMPTABLE,
    description: 'Gère la facturation, les paiements et la comptabilité.',
    permissions: [
      'client:read', 'fournisseur:read', 'produit:read',
      'vente:read', 'vente:create', 'vente:update', 'vente:validate',
      'paiement:manage', 'stock:read',
      'comptabilite:read', 'comptabilite:manage', 'dashboard:read'
    ],
  },
  {
    name: USER_ROLES.COMMERCIAL,
    description: 'Gère le cycle de vente et les relations clients.',
    permissions: [
      'client:create', 'client:read', 'client:update', 'client:delete',
      'produit:read',
      'vente:create', 'vente:read', 'vente:update',
      'dashboard:read'
    ],
  },
  {
    name: USER_ROLES.VENDEUR,
    description: 'Accès limité à la création de documents de vente simples.',
    permissions: [
      'client:create', 'client:read',
      'produit:read',
      'vente:create', 'vente:read',
      'dashboard:read'
    ],
  },
];

const seedPermissionsAndRoles = async () => {
  try {
    await Permission.deleteMany({});
    await Role.deleteMany({});

    const insertedPermissions = await Permission.insertMany(permissionsData);
    logger.info(`✅ ${insertedPermissions.length} permissions créées.`);

    const permissionMap = insertedPermissions.reduce((map, p) => ({ ...map, [p.name]: p._id }), {});

    const rolesToCreate = rolesConfig.map(config => {
      const permissionIds = (config.permissions === 'all')
        ? insertedPermissions.map(p => p._id)
        : config.permissions.map(name => permissionMap[name]).filter(Boolean);
      
      return { name: config.name, description: config.description, permissions: permissionIds };
    });

    await Role.insertMany(rolesToCreate);
    logger.info(`✅ ${rolesToCreate.length} rôles créés.`);

  } catch (error) {
    logger.error('❌ Erreur lors de l’amorçage des permissions et des rôles :', error);
    throw error;
  }
};

module.exports = seedPermissionsAndRoles;