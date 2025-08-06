// server/models/commercial/Produit.js
// ==============================================================================
//                Modèle Mongoose pour les Produits et Services
// ==============================================================================

const mongoose = require('mongoose');
const numerotationService = require('../../services/system/numerotationService');

const produitSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du produit est obligatoire.'],
      trim: true,
      unique: true,
    },
    reference: {
      type: String,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Produit', 'Service'],
      default: 'Produit',
    },
    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categorie',
    },
    prixVenteHT: {
      type: Number,
      required: [true, 'Le prix de vente est obligatoire.'],
      default: 0,
      min: 0,
    },
    coutAchatHT: {
      type: Number,
      default: 0,
      min: 0,
    },
    tauxTVA: {
      type: Number,
      default: 18,
      min: 0,
    },
    suiviStock: {
      type: Boolean,
      default: function() { return this.type === 'Produit'; }
    },
    quantiteEnStock: {
      type: Number,
      default: 0,
      validate: {
        validator: function(value) {
          // La quantité en stock ne peut pas être négative si le suivi est activé
          return !this.suiviStock || value >= 0;
        },
        message: 'La quantité en stock ne peut pas être négative.'
      }
    },
    seuilAlerteStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modifiePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    isActive: {
      type: Boolean,
      default: true,
    }
  },
  {
    timestamps: true,
    collection: 'commercial_produits',
  }
);

// --- HOOK PRE-SAVE pour la numérotation automatique de la référence ---
produitSchema.pre('save', async function(next) {
  if (this.isNew && !this.reference) {
    try {
      this.reference = await numerotationService.getNextNumero('produit');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

produitSchema.index({ nom: 'text', reference: 'text' });
produitSchema.index({ categorie: 1 });


const Produit = mongoose.models.Produit || mongoose.model('Produit', produitSchema);

module.exports = Produit;