// server/models/commercial/Devis.js
// ==============================================================================
//                Modèle Mongoose pour les Devis
// ==============================================================================

const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService');

const devisSchema = new mongoose.Schema(
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
      required: [true, 'Le client est obligatoire.'],
    },
    dateEmission: {
      type: Date,
      default: Date.now,
    },
    dateValidite: {
      type: Date,
      required: [true, 'La date de validité est obligatoire.'],
    },
    lignes: {
      type: [ligneDocumentSchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'Un devis doit contenir au moins une ligne.'],
    },
    totalHT: { type: Number, required: true, default: 0 },
    totalTVA: { type: Number, required: true, default: 0 },
    totalTTC: { type: Number, required: true, default: 0 },
    statut: {
      type: String,
      enum: Object.values(DOCUMENT_STATUS),
      default: DOCUMENT_STATUS.BROUILLON,
    },
    commandeAssociee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commande',
      default: null
    },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: 'commercial_devis',
  }
);

// --- HOOK PRE-SAVE pour la numérotation automatique ---
devisSchema.pre('save', async function(next) {
  if (this.isNew && !this.numero) {
    try {
      this.numero = await numerotationService.getNextNumero('devis');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

devisSchema.index({ client: 1 });
devisSchema.index({ dateEmission: -1 });

const Devis = mongoose.models.Devis || mongoose.model('Devis', devisSchema);

module.exports = Devis;