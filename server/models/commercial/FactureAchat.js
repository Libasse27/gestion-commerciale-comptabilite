// server/models/commercial/FactureAchat.js
const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService');
const { roundTo } = require('../../utils/numberUtils');

const factureAchatSchema = new mongoose.Schema(
  {
    numeroInterne: { type: String, unique: true, trim: true, uppercase: true },
    numeroFactureFournisseur: { type: String, required: [true, 'Le numéro de la facture du fournisseur est obligatoire.'], trim: true },
    fournisseur: { type: mongoose.Schema.Types.ObjectId, ref: 'Fournisseur', required: true },
    dateFacture: { type: Date, required: true },
    dateEcheance: { type: Date, required: true },
    lignes: {
      type: [ligneDocumentSchema],
      validate: [v => Array.isArray(v) && v.length > 0, "Une facture d'achat doit contenir au moins une ligne."],
    },
    totalHT: { type: Number, required: true, default: 0 },
    totalTVA: { type: Number, required: true, default: 0 },
    totalTTC: { type: Number, required: true, default: 0 },
    montantPaye: { type: Number, default: 0 },
    soldeAPayer: { type: Number, required: true },
    statut: { type: String, enum: Object.values(DOCUMENT_STATUS), default: DOCUMENT_STATUS.BROUILLON },
    comptabilise: { type: Boolean, default: false },
    enregistrePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fichierAttacheUrl: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: 'commercial_factures_achats',
  }
);

factureAchatSchema.index({ fournisseur: 1, numeroFactureFournisseur: 1 }, { unique: true });

factureAchatSchema.pre('save', async function(next) {
    if (this.isNew && !this.numeroInterne) {
        try {
            this.numeroInterne = await numerotationService.getNextNumero('facture_achat');
        } catch (error) {
            return next(error);
        }
    }
    
    if (this.isModified('totalTTC') || this.isModified('montantPaye')) {
        this.soldeAPayer = roundTo(this.totalTTC - this.montantPaye);
        
        if (this.statut !== DOCUMENT_STATUS.ANNULE) {
            if (this.soldeAPayer <= 0) {
                this.statut = DOCUMENT_STATUS.PAYEE;
            } else if (this.montantPaye > 0 && this.soldeAPayer > 0) {
                this.statut = DOCUMENT_STATUS.PARTIELLEMENT_PAYEE;
            }
        }
    }

    next();
});

const FactureAchat = mongoose.models.FactureAchat || mongoose.model('FactureAchat', factureAchatSchema);

module.exports = FactureAchat;