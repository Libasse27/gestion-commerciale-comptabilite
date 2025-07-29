// ==============================================================================
//           Modèle Mongoose pour les Informations de l'Entreprise
//
// Ce modèle stocke les informations légales, fiscales et de contact de
// l'entreprise qui utilise l'ERP.
//
// Cette collection est conçue pour ne contenir qu'un seul document, qui
// représente l'identité de l'entreprise. Ces informations seront utilisées
// pour l'en-tête de tous les documents officiels (devis, factures, etc.).
// ==============================================================================

const mongoose = require('mongoose');

const entrepriseSchema = new mongoose.Schema(
  {
    /**
     * Le nom légal de l'entreprise.
     */
    nom: {
      type: String,
      required: [true, 'Le nom de l\'entreprise est obligatoire.'],
      trim: true,
    },

    /**
     * L'adresse complète du siège social.
     */
    adresse: {
      type: String,
      trim: true,
    },

    /**
     * Informations de contact.
     */
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir une adresse email valide.'],
    },
    telephone: {
      type: String,
      trim: true,
    },
    siteWeb: {
      type: String,
      trim: true,
    },

    /**
     * Informations légales et fiscales (Sénégal).
     */
    ninea: {
      type: String,
      trim: true,
    },
    rccm: { // Registre du Commerce et du Crédit Mobilier
      type: String,
      trim: true,
    },
    
    /**
     * Informations pour les documents.
     */
    logoUrl: {
        type: String, // URL vers le logo de l'entreprise (hébergé sur Cloudinary par exemple)
    },
    piedDePageFacture: { // Texte à afficher en bas des factures
        type: String,
        trim: true,
    },
    
    /**
     * Pour s'assurer qu'un seul document est créé.
     * On peut ajouter une valeur fixe et la rendre unique.
     */
    singleton: {
        type: Boolean,
        default: true,
        unique: true,
    }
  },
  {
    timestamps: true,
    collection: 'system_entreprise',
  }
);


const Entreprise = mongoose.model('Entreprise', entrepriseSchema);

module.exports = Entreprise;