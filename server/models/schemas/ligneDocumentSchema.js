// ==============================================================================
//           Schéma Mongoose Partagé pour les Lignes de Document
//
// Ce fichier définit la structure d'une ligne d'item (produit ou service)
// qui est utilisée de manière cohérente dans plusieurs modèles de documents
// commerciaux (Devis, Commande, Facture, BonLivraison, etc.).
//
// Le fait de le centraliser ici assure que tous les documents partagent
// exactement la même structure pour leurs lignes, ce qui est une pratique
// DRY (Don't Repeat Yourself) essentielle.
//
// Ce n'est pas un modèle exporté, mais un schéma réutilisable.
// ==============================================================================

const mongoose = require('mongoose');

const ligneDocumentSchema = new mongoose.Schema(
  {
    /**
     * Référence au produit ou service du catalogue.
     */
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },

    /**
     * Description de la ligne. Par défaut, c'est le nom du produit,
     * mais elle peut être modifiée par l'utilisateur sur le document.
     */
    description: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Quantité de l'item.
     */
    quantite: {
      type: Number,
      required: true,
      min: [0.01, 'La quantité doit être supérieure à zéro.'],
    },

    /**
     * Le prix unitaire Hors Taxes au moment de la création du document.
     * On le stocke ici pour qu'il soit figé, même si le prix du produit
     * change dans le catalogue plus tard.
     */
    prixUnitaireHT: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * Le pourcentage de remise appliqué à cette ligne.
     */
    remise: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },

    /**
     * Le taux de TVA en pourcentage appliqué à cette ligne.
     * Stocké ici pour figer le taux au moment de la création du document.
     */
    tauxTVA: {
      type: Number,
      required: true,
      default: 18,
      min: 0,
    },

    /**
     * Le total Hors Taxes calculé pour la ligne.
     * (Quantité * Prix Unitaire) - Remise
     */
    totalHT: {
      type: Number,
      required: true,
    },
  },
  {
    /**
     * `_id: false` est une option importante. Elle indique à Mongoose de ne
     * PAS créer un ObjectId unique pour chaque ligne de sous-document.
     * C'est généralement souhaitable pour garder les documents plus légers.
     */
    _id: false,
  }
);

module.exports = ligneDocumentSchema;