// server/models/commercial/BonLivraison.js
// ==============================================================================
//                Modèle Mongoose pour les Bons de Livraison (BL)
// ==============================================================================

const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService');

const bonLivraisonSchema = new mongoose.Schema(
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
    dateLivraison: {
      type: Date,
      default: Date.now,
    },
    lignes: {
      type: [ligneDocumentSchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'Un bon de livraison doit contenir au moins une ligne.'],
    },
    adresseLivraison: {
      type: String,
      trim: true,
      required: [true, "L'adresse de livraison est obligatoire."],
    },
    statut: {
      type: String,
      enum: [DOCUMENT_STATUS.EN_PREPARATION, DOCUMENT_STATUS.LIVREE, DOCUMENT_STATUS.ANNULE],
      default: DOCUMENT_STATUS.EN_PREPARATION,
    },
    commandeOrigine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commande',
      required: true,
    },
    factureAssociee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facture',
      default: null,
    },
    transporteur: { type: String, trim: true },
    notes: { type: String, trim: true },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'commercial_bonlivraisons',
  }
);


// --- HOOK PRE-SAVE pour la numérotation automatique ---
bonLivraisonSchema.pre('save', async function(next) {
  if (this.isNew && !this.numero) {
    try {
      this.numero = await numerotationService.getNextNumero('bon_livraison');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

bonLivraisonSchema.index({ client: 1 });
bonLivraisonSchema.index({ commandeOrigine: 1 });
bonLivraisonSchema.index({ dateLivraison: -1 });

const BonLivraison = mongoose.models.BonLivraison || mongoose.model('BonLivraison', bonLivraisonSchema);

module.exports = BonLivraison;