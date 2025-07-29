// ==============================================================================
//                Modèle Mongoose pour les Commandes Clients
//
// MISE À JOUR : Utilise maintenant le `numerotationService` pour générer
// automatiquement le `numero` de la commande.
// ==============================================================================

const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService'); // Import du service

const commandeSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      unique: true,
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
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
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
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
      // Appel au service de numérotation pour le type 'commande'
      this.numero = await numerotationService.getNextNumero('commande');
    } catch (error) {
      return next(error);
    }
  }
  next();
});


const Commande = mongoose.model('Commande', commandeSchema);

module.exports = Commande;