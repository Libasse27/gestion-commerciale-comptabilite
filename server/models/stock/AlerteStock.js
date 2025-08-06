// server/models/stock/AlerteStock.js
// ==============================================================================
//           Modèle Mongoose pour les Alertes de Stock
// ==============================================================================

const mongoose = require('mongoose');

const alerteStockSchema = new mongoose.Schema(
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
    seuilAlerte: {
        type: Number,
        required: true,
    },
    quantiteRestante: {
        type: Number,
        required: true,
    },
    statut: {
        type: String,
        enum: ['Active', 'Resolue', 'Ignoree'],
        default: 'Active',
        index: true,
    },
    resoluPar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    dateResolution: {
        type: Date,
    }
  },
  {
    timestamps: true,
    collection: 'stock_alertes',
  }
);


// Index partiel unique : Il ne peut y avoir qu'une seule alerte ACTIVE
// pour une combinaison produit/dépôt donnée.
alerteStockSchema.index(
    { produit: 1, depot: 1, statut: 1 },
    { unique: true, partialFilterExpression: { statut: 'Active' } }
);


const AlerteStock = mongoose.models.AlerteStock || mongoose.model('AlerteStock', alerteStockSchema);

module.exports = AlerteStock;