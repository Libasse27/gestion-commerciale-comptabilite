// server/models/stock/MouvementStock.js
const mongoose = require('mongoose');
const { STOCK_MOVEMENT_TYPES } = require('../../utils/constants');

const mouvementStockSchema = new mongoose.Schema(
  {
    produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
    depot: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', required: true },
    type: { type: String, required: true, enum: Object.values(STOCK_MOVEMENT_TYPES) },
    quantite: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) { return v > 0; },
            message: 'La quantité d\'un mouvement doit être strictement positive.'
        }
    },
    stockAvant: { type: Number, required: true, min: 0 },
    stockApres: { type: Number, required: true, min: 0 },
    referenceDocument: { type: String, trim: true },
    documentId: { type: mongoose.Schema.Types.ObjectId, refPath: 'documentModel' },
    documentModel: {
        type: String,
        enum: ['FactureAchat', 'BonLivraison', 'Inventaire']
    },
    creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'stock_mouvements',
  }
);

mouvementStockSchema.index({ produit: 1, depot: 1, createdAt: -1 });
mouvementStockSchema.index({ createdAt: -1 });

const MouvementStock = mongoose.models.MouvementStock || mongoose.model('MouvementStock', mouvementStockSchema);

module.exports = MouvementStock;