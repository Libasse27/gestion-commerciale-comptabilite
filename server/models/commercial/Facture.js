// ==============================================================================
//                Modèle Mongoose pour les Factures de Vente
//
// MISE À JOUR :
//   - Génération automatique du numéro via `numerotationService`
//   - Calcul automatique du solde dû et du statut
//   - Meilleures validations de champs
// ==============================================================================

const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService');

const factureSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      unique: true,
      trim: true,
      uppercase: true,
    },

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },

    dateEmission: {
      type: Date,
      default: Date.now,
    },

    dateEcheance: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.dateEmission;
        },
        message: "La date d'échéance ne peut pas être antérieure à la date d'émission.",
      },
    },

    lignes: {
      type: [ligneDocumentSchema],
      validate: [
        v => Array.isArray(v) && v.length > 0,
        'Une facture doit contenir au moins une ligne.',
      ],
    },

    // --- Totaux ---
    totalHT: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalTVA: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalTTC: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    montantPaye: {
      type: Number,
      min: 0,
      default: 0,
    },

    soldeDu: {
      type: Number,
      required: true,
      min: 0,
    },

    // --- Statut de la facture ---
    statut: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.BROUILLON,
    },

    comptabilise: {
      type: Boolean,
      default: false,
    },

    // --- Références ---
    commandeOrigine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commande',
      default: null,
    },

    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'commercial_factures',
  }
);

// ==============================================================================
//                           HOOK PRE-SAVE
// - Génère automatiquement un numéro de facture si absent
// - Met à jour le solde dû
// - Met à jour automatiquement le statut de paiement
// ==============================================================================
factureSchema.pre('save', async function (next) {
  if (this.isNew && !this.numero) {
    try {
      this.numero = await numerotationService.getNextNumero('facture');
    } catch (error) {
      return next(error);
    }
  }

  // Calcul du solde dû
  this.soldeDu = parseFloat((this.totalTTC - this.montantPaye).toFixed(2));

  // Mise à jour du statut selon paiement
  if (this.soldeDu <= 0.01) {
    this.statut = DOCUMENT_STATUS.PAYEE;
  } else if (this.montantPaye > 0 && this.soldeDu > 0.01) {
    this.statut = DOCUMENT_STATUS.PARTIELLEMENT_PAYEE;
  }

  // EN_RETARD à gérer par job planifié
  next();
});

const Facture = mongoose.model('Facture', factureSchema);

module.exports = Facture;
