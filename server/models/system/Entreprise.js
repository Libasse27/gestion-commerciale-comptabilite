// server/models/system/Entreprise.js
// ==============================================================================
//           Modèle Mongoose pour les Informations de l'Entreprise
//
// Ce modèle stocke les informations légales, fiscales et de contact de
// l'entreprise qui utilise l'ERP.
//
// Cette collection est conçue pour ne contenir qu'un seul document (pattern
// Singleton), qui représente l'identité de l'entreprise.
// ==============================================================================

const mongoose = require('mongoose');
const { isValidNINEA } = require('../../utils/validators');

const entrepriseSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, "Le nom de l'entreprise est obligatoire."],
      trim: true,
    },
    adresse: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir une adresse email valide.'],
    },
    telephone: {
      type: String,
      trim: true,
    },
    siteWeb: {
      type: String,
      trim: true,
    },
    ninea: {
      type: String,
      trim: true,
      validate: {
          validator: isValidNINEA,
          message: 'Le format du NINEA est invalide.'
      }
    },
    rccm: {
      type: String,
      trim: true,
    },
    logoUrl: {
        type: String,
    },
    piedDePageFacture: {
        type: String,
        trim: true,
    },
    isSingleton: {
        type: Boolean,
        default: true,
        unique: true,
        immutable: true,
    }
  },
  {
    timestamps: true,
    collection: 'system_entreprise',
  }
);


const Entreprise = mongoose.models.Entreprise || mongoose.model('Entreprise', entrepriseSchema);

module.exports = Entreprise;