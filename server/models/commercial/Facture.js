// server/models/commercial/Facture.js
const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService');
const { roundTo } = require('../../utils/numberUtils');

const factureSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true, trim: true, uppercase: true },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    dateEmission: { type: Date, default: Date.now },
    dateEcheance: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) { return value >= this.dateEmission; },
        message: "La date d'échéance ne peut pas être antérieure à la date d'émission.",
      },
    },
    lignes: {
      type: [ligneDocumentSchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'Une facture doit contenir au moins une ligne.'],
    },
    totalHT: { type: Number, required: true, min: 0, default: 0 },
    totalTVA: { type: Number, required: true, min: 0, default: 0 },
    totalTTC: { type: Number, required: true, min: 0, default: 0 },
    montantPaye: { type: Number, min: 0, default: 0 },
    soldeDu: { type: Number, required: true },
    statut: { type: String, enum: Object.values(DOCUMENT_STATUS), default: DOCUMENT_STATUS.BROUILLON },
    comptabilise: { type: Boolean, default: false },
    commandeOrigine: { type: mongoose.Schema.Types.ObjectId, ref: 'Commande', default: null },
    creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: 'commercial_factures',
  }
);

factureSchema.pre('save', async function (next) {
  if (this.isNew && !this.numero) {
    try {
      this.numero = await numerotationService.getNextNumero('facture_vente');
    } catch (error) {
      return next(error);
    }
  }

  if (this.isModified('totalTTC') || this.isModified('montantPaye')) {
    this.soldeDu = roundTo(this.totalTTC - this.montantPaye);
    
    if (this.statut !== DOCUMENT_STATUS.ANNULE) {
      if (this.soldeDu <= 0) {
          this.statut = DOCUMENT_STATUS.PAYEE;
      } else if (this.montantPaye > 0 && this.soldeDu > 0) {
          this.statut = DOCUMENT_STATUS.PARTIELLEMENT_PAYEE;
      } else if (this.dateEcheance < new Date() && this.soldeDu > 0) {
          this.statut = DOCUMENT_STATUS.EN_RETARD;
      } else if (this.statut === DOCUMENT_STATUS.PAYEE && this.soldeDu > 0) {
          // Si une facture était payée et qu'on modifie le montant, elle redevient non payée
          this.statut = DOCUMENT_STATUS.ENVOYE; // ou un autre statut par défaut
      }
    }
  }

  next();
});

factureSchema.index({ client: 1 });
factureSchema.index({ dateEmission: -1 });
factureSchema.index({ statut: 1 });


const Facture = mongoose.models.Facture || mongoose.model('Facture', factureSchema);

module.exports = Facture;