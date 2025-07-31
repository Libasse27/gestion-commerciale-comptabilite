// ==============================================================================
//           Seeder pour les Permissions et les Rôles (RBAC) - Version Finale
//
// Rôle : Ce script est le cœur de la configuration du contrôle d'accès.
// Il garantit que toutes les permissions nécessaires existent, puis crée les
// rôles et leur assigne les permissions appropriées.
//
// NOTE IMPORTANTE : Ce script doit être exécuté AVANT le seeder des utilisateurs.
//
// Usage : `node server/seeds/roles.js` ou via un script npm `npm run seed:roles`
// ==============================================================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- Chargement des dépendances et modèles ---
dotenv.config({ path: './server/.env' });

const Role = require('../models/auth/Role');
const Permission = require('../models/auth/Permission');

// --- 1. Source de Vérité : Définition de toutes les permissions de l'application ---
const allPermissions = [
  // Clients
  { name: 'create:client', description: 'Créer un nouveau client' },
  { name: 'read:client', description: 'Lire les données des clients' },
  { name: 'update:client', description: 'Mettre à jour un client' },
  { name: 'delete:client', description: 'Supprimer un client' },

  // Fournisseurs
  { name: 'create:fournisseur', description: 'Créer un nouveau fournisseur' },
  { name: 'read:fournisseur', description: 'Lire les données des fournisseurs' },
  { name: 'update:fournisseur', description: 'Mettre à jour un fournisseur' },
  { name: 'delete:fournisseur', description: 'Supprimer un fournisseur' },
  
  // Produits & Stocks
  { name: 'create:produit', description: 'Créer un nouveau produit' },
  { name: 'read:produit', description: 'Lire les données des produits' },
  { name: 'update:produit', description: 'Mettre à jour un produit' },
  { name: 'delete:produit', description: 'Supprimer un produit' },
  { name: 'manage:stock', description: 'Gérer les stocks (mouvements, inventaires)' },
  
  // Ventes (Devis, Commandes, BL)
  { name: 'create:vente', description: 'Créer des devis et commandes' },
  { name: 'read:vente', description: 'Voir tous les documents de vente' },
  { name: 'update:vente', description: 'Modifier des documents de vente' },
  { name: 'validate:vente', description: 'Valider des documents (passer de devis à commande, etc.)' },
  
  // Facturation
  { name: 'create:facture', description: 'Créer des factures' },
  { name: 'read:facture', description: 'Lire les factures' },
  { name: 'update:facture', description: 'Mettre à jour des factures' },
  { name: 'delete:facture', description: 'Supprimer des factures' },

  // Comptabilité
  { name: 'read:comptabilite', description: 'Accéder aux journaux, grand livre, etc.' },
  { name: 'manage:comptabilite', description: 'Gérer les écritures et le plan comptable' },

  // Utilisateurs & Rôles
  { name: 'create:user', description: 'Créer un nouvel utilisateur' },
  { name: 'read:user', description: 'Lire les données des utilisateurs' },
  { name: 'update:user', description: 'Mettre à jour un utilisateur' },
  { name: 'delete:user', description: 'Supprimer un utilisateur' },
  { name: 'manage:role', description: 'Gérer les rôles et permissions' },
    
  // Administration & Rapports
  { name: 'read:rapport', description: 'Consulter les rapports d\'analyse' },
  { name: 'manage:settings', description: 'Gérer les paramètres de l\'application' },
];

// --- 2. Définition des Rôles et de leurs Permissions associées ---
const rolesToCreate = [
  {
    name: 'Vendeur',
    description: 'Peut gérer ses propres clients et créer des documents de vente.',
    permissions: ['create:client', 'read:client', 'update:client', 'create:vente', 'read:vente']
  },
  {
    name: 'Commercial',
    description: 'Gère tout le cycle commercial, des produits aux clients et ventes.',
    permissions: [
      'create:client', 'read:client', 'update:client', 'delete:client',
      'create:fournisseur', 'read:fournisseur', 'update:fournisseur',
      'create:produit', 'read:produit', 'update:produit',
      'manage:stock',
      'create:vente', 'read:vente', 'update:vente', 'validate:vente',
      'create:facture', 'read:facture', 'read:rapport'
    ]
  },
  {
    name: 'Comptable',
    description: 'Gère la comptabilité, les factures et a un accès en lecture aux données commerciales.',
    permissions: [
      'read:client', 'read:fournisseur', 'read:produit', 'read:vente',
      'create:facture', 'read:facture', 'update:facture', 'delete:facture',
      'read:comptabilite', 'manage:comptabilite', 'read:rapport'
    ]
  },
  {
    name: 'Admin',
    description: 'Administrateur du système avec un accès complet à toutes les fonctionnalités.',
    permissions: '*' // Le joker '*' signifie "toutes les permissions"
  }
];


/**
 * Fonction principale du seeder.
 */
const seedRolesAndPermissions = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie pour le seeder des rôles.');

    // --- Étape A : Créer/Mettre à jour toutes les permissions ---
    console.log('⏳ Synchronisation des permissions...');
    for (const p of allPermissions) {
      // `findOneAndUpdate` avec `upsert: true` va créer la permission si elle n'existe pas,
      // ou la mettre à jour si sa description a changé. C'est idempotent.
      await Permission.findOneAndUpdate({ name: p.name }, p, { upsert: true });
    }
    console.log(`-> ${allPermissions.length} permissions synchronisées.`);

    // --- Étape B : Récupérer toutes les permissions pour les mapper aux rôles ---
    const allPermissionsFromDB = await Permission.find({});
    // On crée une Map pour un accès instantané à l'ID par le nom (plus performant)
    const permissionMap = new Map(allPermissionsFromDB.map(p => [p.name, p._id]));

    // --- Étape C : Nettoyer et créer les rôles ---
    console.log('🧹 Nettoyage de la collection "roles"...');
    await Role.deleteMany({});
    
    console.log('⏳ Création des rôles...');
    for (const roleData of rolesToCreate) {
      let permissionIds;

      if (roleData.permissions === '*') {
        // Pour l'admin, on assigne toutes les permissions
        permissionIds = [...permissionMap.values()];
      } else {
        // Pour les autres rôles, on mappe les noms de permissions à leurs IDs
        permissionIds = roleData.permissions.map(permissionName => {
          const permissionId = permissionMap.get(permissionName);
          if (!permissionId) {
            throw new Error(`Permission "${permissionName}" non trouvée pour le rôle "${roleData.name}".`);
          }
          return permissionId;
        });
      }
      
      await Role.create({
        name: roleData.name,
        description: roleData.description,
        permissions: permissionIds,
      });
    }
    console.log(`-> ${rolesToCreate.length} rôles ont été créés avec succès.`);

  } catch (error) {
    console.error('❌ Erreur lors du seeding des rôles et permissions :', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Connexion à MongoDB fermée.');
  }
};

// --- Lancement du Seeder ---
seedRolesAndPermissions();