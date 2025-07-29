// ==============================================================================
//                Modèle Mongoose pour les Produits et Services
//
// MISE À JOUR : Le champ `categorie` est maintenant une référence (`ref`) vers
// le modèle `Categorie` pour permettre une structuration hiérarchique du catalogue.
// ==============================================================================

const mongoose = require('mongoose');

const produitSchema = new mongoose.Schema(
  {
    /**
     * Le nom du produit ou du service.
     */
    nom: {
      type: String,
      required: [true, 'Le nom du produit est obligatoire.'],
      trim: true,
      unique: true,
    },

    /**
     * Le code ou la référence unique du produit (SKU).
     */
    reference: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      uppercase: true,
    },

    /**
     * Description détaillée du produit/service.
     */
    description: {
      type: String,
      trim: true,
    },

    /**
     * Type de produit pour distinguer les biens physiques des services.
     */
    type: {
      type: String,
      required: true,
      enum: ['Produit', 'Service'],
      default: 'Produit',
    },

    /**
     * Catégorie du produit.
     * C'est maintenant une référence à un document de la collection 'Categorie'.
     */
    categorie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Categorie', // Fait le lien avec le modèle Categorie
      required: false, // Changez à `true` si une catégorie est toujours obligatoire
    },

    /**
     * Informations sur les prix et les coûts.
     */
    prixVente: {
      type: Number,
      required: [true, 'Le prix de vente est obligatoire.'],
      default: 0,
      min: 0,
    },
    coutAchat: {
      type: Number,
      default: 0,
      min: 0,
    },

    /**
     * Taux de TVA applicable à ce produit.
     */
    tauxTVA: {
      type: Number,
      default: 18,
      min: 0,
    },

    /**
     * Gestion des stocks.
     */
    suiviStock: {
      type: Boolean,
      default: function() { return this.type === 'Produit'; }
    },
    quantiteEnStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    seuilAlerteStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    
    /**
     * Référence à l'utilisateur qui a créé ce produit.
     */
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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

// Index pour accélérer les recherches par nom et référence
produitSchema.index({ nom: 'text', reference: 'text' });

const Produit = mongoose.model('Produit', produitSchema);

module.exports = Produit;