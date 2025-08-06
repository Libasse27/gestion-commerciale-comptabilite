// server/models/commercial/Commande.js
// ==============================================================================
//                Modèle Mongoose pour les Commandes Clients
// ==============================================================================

const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService');

const commandeSchema = new mongoose.Schema(
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
      required: [true, 'Le client est obligatoire pour une commande.'],
    },
    dateCommande: {
      type: Date,
      default: Date.now,
    },
    dateLivraisonPrevue: {
      type: Date,
    },
    lignes: {
      type: [ligneDocumentSchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'Une commande doit contenir au moins une ligne.'],
    },
    totalHT: { type: Number, required: true, default: 0 },
    totalTVA: { type: Number, required: true, default: 0 },
    totalTTC: { type: Number, required: true, default: 0 },
    statut: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.EN_PREPARATION,
    },
    devisOrigine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Devis',
      default: null,
    },
    facturesAssociees: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Facture'
    }],
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: 'commercial_commandes',
  }
);

// --- HOOK PRE-SAVE pour la numérotation automatique ---
commandeSchema.pre('save', async function(next) {
  if (this.isNew && !this.numero) {
    try {
      this.numero = await numerotationService.getNextNumero('commande');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

commandeSchema.index({ client: 1 });
commandeSchema.index({ dateCommande: -1 });

const Commande = mongoose.models.Commande || mongoose.model('Commande', commandeSchema);

module.exports = Commande;