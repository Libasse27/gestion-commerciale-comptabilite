// server/models/paiements/MobileMoneyTransaction.js
const mongoose = require('mongoose');

const mobileMoneyTransactionSchema = new mongoose.Schema(
  {
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    operateur: {
        type: String,
        required: true,
        enum: ['OrangeMoney', 'Wave', 'FreeMoney', 'Autre'],
    },
    type: {
        type: String,
        required: true,
        enum: ['PaiementClient', 'Remboursement', 'PaiementFournisseur'],
    },
    montant: {
        type: Number,
        required: true,
        min: 0,
    },
    frais: {
        type: Number,
        default: 0,
        min: 0,
    },
    statutOperateur: {
        type: String,
        required: true,
        enum: ['INITIEE', 'EN_COURS', 'REUSSIE', 'ECHOUEE', 'ANNULEE'],
        default: 'INITIEE',
    },
    paiementInterne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paiement',
      default: null,
    },
    numeroTelephone: {
        type: String,
        trim: true,
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: 'paiements_mobilemoney_transactions',
  }
);

mobileMoneyTransactionSchema.index({ statutOperateur: 1, createdAt: -1 });

const MobileMoneyTransaction = mongoose.models.MobileMoneyTransaction || mongoose.model('MobileMoneyTransaction', mobileMoneyTransactionSchema);

module.exports = MobileMoneyTransaction;