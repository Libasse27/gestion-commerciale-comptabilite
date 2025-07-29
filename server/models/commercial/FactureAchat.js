// ==============================================================================
//                Modèle Mongoose pour les Factures d'Achat
//
// MISE À JOUR : Ajout d'un numéro de référence interne unique (`numeroInterne`)
// généré automatiquement par le `numerotationService`.
// ==============================================================================

const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService');

const factureAchatSchema = new mongoose.Schema(
  {
    /**
     * Numéro de référence interne, unique et généré automatiquement.
     * Ex: 'FA-2024-0001'
     */
    numeroInterne: {
      type: String,
      unique: true,
    },

    /**
     * Le numéro de la facture tel qu'il apparaît sur le document du fournisseur.
     */
    numeroFactureFournisseur: {
      type: String,
      required: true,
      trim: true,
    },
    
    fournisseur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Fournisseur',
      required: true,
    },
    
    dateFacture: { type: Date, required: true },
    dateEcheance: { type: Date, required: true },
    
    lignes: {
      type: [ligneDocumentSchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'Une facture d\'achat doit contenir au moins une ligne.'],
    },
    
    totalHT: { type: Number, required: true, default: 0 },
    totalTVA: { type: Number, required: true, default: 0 },
    totalTTC: { type: Number, required: true, default: 0 },

    montantPaye: { type: Number, default: 0 },
    soldeAPayer: { type: Number, required: true },
    
    statut: {
      type: String,
      enum: [
        DOCUMENT_STATUS.BROUILLON,
        DOCUMENT_STATUS.PAYEE,
        DOCUMENT_STATUS.PARTIELLEMENT_PAYEE,
        DOCUMENT_STATUS.EN_RETARD,
        DOCUMENT_STATUS.ANNULE,
      ],
      default: DOCUMENT_STATUS.BROUILLON,
    },
    comptabilise: { type: Boolean, default: false },
    
    enregistrePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'commercial_factures_achats',
  }
);

// Index pour améliorer la recherche
factureAchatSchema.index({ fournisseur: 1, dateFacture: -1 });
factureAchatSchema.index({ numeroFactureFournisseur: 1, fournisseur: 1 }, { unique: true });


// Hook pre-save pour les calculs et la numérotation
factureAchatSchema.pre('save', async function(next) {
    // Générer le numéro interne si c'est un nouveau document
    if (this.isNew && !this.numeroInterne) {
        try {
            this.numeroInterne = await numerotationService.getNextNumero('factureAchat');
        } catch (error) {
            return next(error);
        }
    }
    
    // Calculer le solde à payer
    this.soldeAPayer = this.totalTTC - this.montantPaye;
    
    // Mettre à jour le statut
    if (this.soldeAPayer <= 0.01) {
        this.statut = DOCUMENT_STATUS.PAYEE;
    } else if (this.montantPaye > 0 && this.soldeAPayer > 0) {
        this.statut = DOCUMENT_STATUS.PARTIELLEMENT_PAYEE;
    }

    next();
});

const FactureAchat = mongoose.model('FactureAchat', factureAchatSchema);

module.exports = FactureAchat;