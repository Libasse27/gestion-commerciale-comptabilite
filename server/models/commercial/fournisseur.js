// server/models/commercial/Fournisseur.js
// ==============================================================================
//                Modèle Mongoose pour les Fournisseurs
// ==============================================================================

const mongoose = require('mongoose');
const numerotationService = require('../../services/system/numerotationService');
const { isValidNINEA } = require('../../utils/validators');

const fournisseurSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du fournisseur est obligatoire.'],
      trim: true,
      index: true, // Méthode propre pour un index simple
    },
    codeFournisseur: {
      type: String,
      unique: true, // Cette option crée déjà un index unique.
      uppercase: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir une adresse email valide.'],
    },
    telephone: { type: String, trim: true },
    adresse: { type: String, trim: true },
    contactPrincipal: { type: String, trim: true },
    ninea: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) { return !v || isValidNINEA(v); },
        message: 'Le format du NINEA est invalide.'
      }
    },
    delaiLivraisonJours: { type: Number, default: 7, min: 0 },
    conditionsPaiement: { type: String, default: 'Net 30' },
    solde: { type: Number, default: 0 },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modifiePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'commercial_fournisseurs',
  }
);


// --- HOOK PRE-SAVE pour la numérotation automatique ---
fournisseurSchema.pre('save', async function(next) {
  if (this.isNew && !this.codeFournisseur) {
    try {
      this.codeFournisseur = await numerotationService.getNextNumero('fournisseur');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Il n'y a plus besoin de déclarer les index simples ici.

const Fournisseur = mongoose.models.Fournisseur || mongoose.model('Fournisseur', fournisseurSchema);

module.exports = Fournisseur;