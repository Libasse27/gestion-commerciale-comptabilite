// ==============================================================================
//           Seeder pour les Paramètres Fiscaux et d'Entreprise
//
// Rôle : Ce script initialise un document unique dans la base de données
// contenant les informations fiscales et légales de l'entreprise qui utilise
// l'ERP. C'est un modèle de type "singleton".
//
// NOTE IMPORTANTE : Ce script peut être exécuté indépendamment.
//
// Usage : `node server/seeds/parametresFiscaux.js` ou via `npm run seed:fiscal`
// ==============================================================================

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// --- Chargement des dépendances et modèles ---
dotenv.config({ path: './server/.env' });

// Assurez-vous que ce chemin correspond à votre modèle
const ParametreFiscal = require('../models/fiscal/ParametreFiscal'); 

// --- Définition des Paramètres par Défaut ---
// REMPLACEZ CES VALEURS PAR CELLES DE L'ENTREPRISE CIBLE
const parametresData = {
  // Informations légales de l'entreprise
  raisonSociale: 'Votre Entreprise SARL',
  ninea: '001234567 2G3', // Numéro d'Identification National des Entreprises et des Associations
  rccm: 'SN.DKR.2025.A.12345', // Registre du Commerce et du Crédit Mobilier
  adresse: '123 Avenue Cheikh Anta Diop, Fann, Dakar, Sénégal',
  telephone: '+221 33 800 00 00',
  email: 'contact@votre-entreprise.sn',
  
  // Paramètres fiscaux
  tauxTVAStandard: 18, // Taux de TVA standard au Sénégal
  regimeFiscal: 'Réel Normal', // ou 'Réel Simplifié'

  // Paramètres monétaires
  devise: 'XOF',
  symboleDevise: 'FCFA',
};


/**
 * Fonction principale du seeder pour les paramètres fiscaux.
 */
const seedParametresFiscaux = async () => {
  try {
    // --- 1. Connexion à la base de données ---
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connexion à MongoDB réussie pour le seeder des paramètres fiscaux.');

    // --- 2. Nettoyage de la collection (garantit le singleton) ---
    await ParametreFiscal.deleteMany({});
    console.log('🧹 Collection "parametresfiscaux" nettoyée.');

    // --- 3. Création du document unique de paramètres ---
    await ParametreFiscal.create(parametresData);
    console.log('✅ Le document des paramètres fiscaux et d\'entreprise a été créé avec succès.');
    
  } catch (error) {
    // --- 4. Gestion des erreurs ---
    console.error('❌ Erreur lors de la création des paramètres fiscaux :', error);
  } finally {
    // --- 4. Fermeture de la connexion à la base de données ---
    await mongoose.disconnect();
    console.log('🔌 Connexion à MongoDB fermée.');
  }
};

seedParametresFiscaux();
