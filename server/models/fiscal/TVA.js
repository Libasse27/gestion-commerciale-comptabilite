// server/models/fiscal/TVA.js
const mongoose = require('mongoose');

const tvaSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['Collectee', 'Deductible'],
    },
    baseHT: {
      type: Number,
      required: true,
    },
    taux: {
        type: Number,
        required: true,
    },
    montant: {
        type: Number,
        required: true,
    },
    compteComptable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompteComptable',
        required: true,
    },
    sourceDocumentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'sourceDocumentModel',
        required: true,
    },
    sourceDocumentModel: {
        type: String,
        enum: ['Facture', 'FactureAchat'],
        required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'fiscal_tva_transactions',
  }
);

tvaSchema.index({ date: 1, type: 1 });

const TVA = mongoose.models.TVA || mongoose.model('TVA', tvaSchema);

module.exports = TVA;