// ==============================================================================
//                Modèle Mongoose pour les Fournisseurs
//
// MISE À JOUR : Utilise maintenant le `numerotationService` pour générer
// automatiquement le `codeFournisseur` de manière configurable.
// ==============================================================================

const mongoose = require('mongoose');
// Import du service de numérotation, qui remplace l'ancien modèle Compteur
const numerotationService = require('../../services/system/numerotationService');

const fournisseurSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du fournisseur est obligatoire.'],
      trim: true,
    },
    codeFournisseur: {
      type: String,
      unique: true,
      sparse: true,
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
    ninea: { type: String, trim: true },
    delaiLivraisonJours: { type: Number, default: 7 },
    conditionsPaiement: { type: String, default: 'Net 30' },
    solde: { type: Number, default: 0 },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
      // Appel au nouveau service en spécifiant le type de document 'fournisseur'
      this.codeFournisseur = await numerotationService.getNextNumero('fournisseur');
    } catch (error) {
      return next(error);
    }
  }
  next();
});


// Index pour accélérer les recherches par nom et code
fournisseurSchema.index({ nom: 'text', codeFournisseur: 'text' });

const Fournisseur = mongoose.model('Fournisseur', fournisseurSchema);

module.exports = Fournisseur;