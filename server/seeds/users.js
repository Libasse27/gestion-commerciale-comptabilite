// ==============================================================================
//           Seeder pour les Utilisateurs et leur Assignation de Rôle
//
// Rôle : Ce script popule la base de données avec un jeu d'utilisateurs
// prédéfinis, chacun associé à un rôle spécifique.
//
// NOTE IMPORTANTE : Ce script doit être exécuté APRES les seeders pour
// les permissions et les rôles, car il dépend de l'existence des rôles
// dans la base de données.
//
// Usage : `node server/seeds/users.js` ou via un script npm `npm run seed:users`
// ==============================================================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// --- Chargement des dépendances et modèles ---
// Spécifier le chemin vers le fichier .env du backend
dotenv.config({ path: './server/.env' });

const User = require('../models/auth/User');
const Role = require('../models/auth/Role');

// --- Données des utilisateurs à créer ---
// Les mots de passe sont en clair ici mais seront hashés avant l'insertion.
// ATTENTION : N'utilisez jamais ces mots de passe en production.
const usersData = [
  {
    firstName: 'Admin',
    lastName: 'Principal',
    email: 'admin@erp.sn',
    password: 'password123',
    roleName: 'Admin', // Le nom du rôle à chercher dans la DB
    isActive: true,
  },
  {
    firstName: 'Jean',
    lastName: 'Comptable',
    email: 'comptable@erp.sn',
    password: 'password123',
    roleName: 'Comptable',
    isActive: true,
  },
  {
    firstName: 'Awa',
    lastName: 'Commerciale',
    email: 'commercial@erp.sn',
    password: 'password123',
    roleName: 'Commercial',
    isActive: true,
  },
  {
    firstName: 'Moussa',
    lastName: 'Vendeur',
    email: 'vendeur@erp.sn',
    password: 'password123',
    roleName: 'Vendeur',
    isActive: true,
  },
];


/**
 * Fonction principale du seeder.
 */
const seedUsers = async () => {
  try {
    // --- 1. Connexion à la base de données ---
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie pour le seeder utilisateurs.');

    // --- 2. Nettoyage de la collection Users ---
    await User.deleteMany({});
    console.log('🧹 Collection "users" nettoyée.');

    // --- 3. Récupération des rôles depuis la DB ---
    const roles = await Role.find({});
    if (roles.length === 0) {
      throw new Error("Aucun rôle trouvé dans la base de données. Veuillez d'abord lancer le seeder des rôles.");
    }

    // Création d'une map pour un accès facile à l'ID du rôle par son nom
    const roleMap = roles.reduce((map, role) => {
      map[role.name] = role._id;
      return map;
    }, {});
    
    // --- 4. Préparation et création des utilisateurs ---
    const usersToCreate = [];
    for (const userData of usersData) {
      const roleId = roleMap[userData.roleName];
      if (!roleId) {
        console.warn(`⚠️ Rôle "${userData.roleName}" non trouvé. L'utilisateur "${userData.email}" sera ignoré.`);
        continue;
      }
      
      // Hashage du mot de passe
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(userData.password, salt);

      usersToCreate.push({
        ...userData,
        password: hashedPassword,
        role: roleId,
      });
    }

    // --- 5. Insertion des utilisateurs en base de données ---
    await User.insertMany(usersToCreate);
    console.log(`✅ ${usersToCreate.length} utilisateurs ont été créés avec succès.`);
    console.log('--- Liste des utilisateurs créés ---');
    usersToCreate.forEach(u => console.log(`- ${u.email} (Rôle: ${u.roleName})`));
    

  } catch (error) {
    console.error('❌ Erreur lors du seeding des utilisateurs :', error);
    process.exit(1); // Arrête le script en cas d'erreur
  } finally {
    // --- 6. Fermeture de la connexion ---
    await mongoose.connection.close();
    console.log('🔌 Connexion à MongoDB fermée.');
  }
};

// --- Lancement du Seeder ---
seedUsers();