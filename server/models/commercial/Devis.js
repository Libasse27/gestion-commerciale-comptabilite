// ==============================================================================
//                Modèle Mongoose pour les Devis
//
// MISE À JOUR : Utilise maintenant le `numerotationService` pour générer
// automatiquement le `numero` du devis.
// ==============================================================================

const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService'); // Import du service

/**
 * Schéma principal pour le Devis.
 */
const devisSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      unique: true,
      // Le `required: true` est important, mais la valeur sera fournie par le hook pre-save.
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
    dateValidite: {
      type: Date,
      required: true,
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
    
    commandeAssociee: { type: mongoose.Schema.Types.ObjectId, ref: 'Commande', default: null },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
      // Appel au service de numérotation pour le type 'devis'
      this.numero = await numerotationService.getNextNumero('devis');
    } catch (error) {
      return next(error);
    }
  }
  next();
});


const Devis = mongoose.model('Devis', devisSchema);

module.exports = Devis;