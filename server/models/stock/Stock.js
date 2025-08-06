// server/models/stock/Stock.js
// ==============================================================================
//                Modèle Mongoose pour l'État du Stock
//
// Représente la liaison entre un Produit et un Dépôt, en spécifiant
// la quantité disponible.
// ==============================================================================

const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },
    depot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Depot',
      required: true,
    },
    quantite: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'La quantité en stock ne peut pas être négative.'],
    },
    emplacement: {
        type: String,
        trim: true,
    },
    seuilAlerte: {
        type: Number,
        default: 0,
        min: 0,
    }
  },
  {
    timestamps: true,
    collection: 'stock_etats',
  }
);

// --- INDEX UNIQUE ---
// Garantit qu'il ne peut y avoir qu'UNE SEULE ligne de stock pour
// une combinaison unique de produit et de dépôt.
stockSchema.index({ produit: 1, depot: 1 }, { unique: true });


const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema);

module.exports = Stock;