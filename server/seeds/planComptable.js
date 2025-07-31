// ==============================================================================
//           Seeder pour le Plan Comptable (SYSCOHADA)
//
// Rôle : Ce script popule la base de données avec les comptes comptables de
// base nécessaires au fonctionnement de l'ERP, conformément au plan SYSCOHADA.
//
// NOTE IMPORTANTE : Ce script peut être exécuté indépendamment des autres seeders.
//
// Usage : `node server/seeds/planComptable.js` ou via `npm run seed:compta`
// ==============================================================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- Chargement des dépendances et modèles ---
dotenv.config({ path: './server/.env' });

const CompteComptable = require('../models/comptabilite/CompteComptable');

// --- Définition d'un extrait du Plan Comptable SYSCOHADA ---
// Cette liste n'est pas exhaustive mais contient les comptes les plus
// importants pour démarrer une activité commerciale.
// Les champs `estTiers` et `estTresorerie` sont des aides pour la logique applicative.
const planComptableData = [
  // --- CLASSE 1 : COMPTES DE RESSOURCES DURABLES ---
  { numeroCompte: '1010', libelle: 'Capital social', classe: 1 },
  { numeroCompte: '1310', libelle: 'Subventions d\'équipement', classe: 1 },
  
  // --- CLASSE 2 : COMPTES DE L'ACTIF IMMOBILISÉ ---
  { numeroCompte: '2110', libelle: 'Frais de recherche et de développement', classe: 2 },
  { numeroCompte: '2411', libelle: 'Matériel et outillage industriel et commercial', classe: 2 },
  { numeroCompte: '2441', libelle: 'Matériel de transport', classe: 2 },
  { numeroCompte: '2812', libelle: 'Amortissements des brevets, licences, logiciels', classe: 2 },

  // --- CLASSE 3 : COMPTES DE STOCKS ---
  { numeroCompte: '3110', libelle: 'Marchandises', classe: 3 },
  { numeroCompte: '3810', libelle: 'Stocks en voie d\'acheminement', classe: 3 },
  
  // --- CLASSE 4 : COMPTES DE TIERS ---
  { numeroCompte: '4011', libelle: 'Fournisseurs', classe: 4, estTiers: true },
  { numeroCompte: '4081', libelle: 'Fournisseurs - Factures non parvenues', classe: 4, estTiers: true },
  { numeroCompte: '4111', libelle: 'Clients', classe: 4, estTiers: true },
  { numeroCompte: '4181', libelle: 'Clients - Factures à établir', classe: 4, estTiers: true },
  { numeroCompte: '4451', libelle: 'État, TVA facturée', classe: 4 },
  { numeroCompte: '4452', libelle: 'État, TVA récupérable sur immobilisations', classe: 4 },
  { numeroCompte: '4456', libelle: 'État, TVA récupérable sur achats et services', classe: 4 },
  { numeroCompte: '4457', libelle: 'État, Crédit de TVA à reporter', classe: 4 },
  
  // --- CLASSE 5 : COMPTES DE TRÉSORERIE ---
  { numeroCompte: '5210', libelle: 'Banques locales', classe: 5, estTresorerie: true },
  { numeroCompte: '5310', libelle: 'Chèques postaux', classe: 5, estTresorerie: true },
  { numeroCompte: '5710', libelle: 'Caisse Siège', classe: 5, estTresorerie: true },
  { numeroCompte: '5850', libelle: 'Virements de fonds', classe: 5, estTresorerie: true },
  // Spécifique Sénégal pour intégration Mobile Money
  { numeroCompte: '5541', libelle: 'Orange Money', classe: 5, estTresorerie: true },
  { numeroCompte: '5542', libelle: 'Wave', classe: 5, estTresorerie: true },

  // --- CLASSE 6 : COMPTES DE CHARGES ---
  { numeroCompte: '6011', libelle: 'Achats de marchandises', classe: 6 },
  { numeroCompte: '6031', libelle: 'Variations des stocks de marchandises (débit)', classe: 6 },
  { numeroCompte: '6120', libelle: 'Redevances de crédit-bail et contrats assimilés', classe: 6 },
  { numeroCompte: '6220', libelle: 'Locations et charges locatives', classe: 6 },
  { numeroCompte: '6270', libelle: 'Frais de télécommunications', classe: 6 },
  { numeroCompte: '6311', libelle: 'Salaires et appointements', classe: 6 },
  { numeroCompte: '6350', libelle: 'Cotisations sociales', classe: 6 },
  { numeroCompte: '6400', libelle: 'Impôts et taxes', classe: 6 },
  { numeroCompte: '6910', libelle: 'Dotations aux amortissements d\'exploitation', classe: 6 },
  
  // --- CLASSE 7 : COMPTES DE PRODUITS ---
  { numeroCompte: '7011', libelle: 'Ventes de marchandises', classe: 7 },
  { numeroCompte: '7061', libelle: 'Prestations de services', classe: 7 },
  { numeroCompte: '7031', libelle: 'Variations des stocks de marchandises (crédit)', classe: 7 },
];


/**
 * Fonction principale du seeder pour le plan comptable.
 */
const seedPlanComptable = async () => {
  try {
    // --- 1. Connexion à la base de données ---
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie pour le seeder du plan comptable.');

    // --- 2. Nettoyage de la collection CompteComptable ---
    await CompteComptable.deleteMany({});
    console.log('🧹 Collection "comptecomptables" nettoyée.');

    // --- 3. Insertion des comptes en base de données ---
    await CompteComptable.insertMany(planComptableData);
    console.log(`✅ ${planComptableData.length} comptes comptables ont été insérés avec succès.`);
    
  } catch (error) {
    console.error('❌ Erreur lors du seeding du plan comptable :', error);
    process.exit(1); // Arrête le script en cas d'erreur
  } finally {
    // --- 4. Fermeture de la connexion ---
    await mongoose.connection.close();
    console.log('🔌 Connexion à MongoDB fermée.');
  }
};

// --- Lancement du Seeder ---
seedPlanComptable();