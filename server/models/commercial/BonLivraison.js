// ==============================================================================
//                Modèle Mongoose pour les Bons de Livraison (BL)
//
// MISE À JOUR : Utilise maintenant le `numerotationService` pour générer
// automatiquement le `numero` du Bon de Livraison.
// ==============================================================================

const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService'); // Import du service

const bonLivraisonSchema = new mongoose.Schema(
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
      // Appel au service de numérotation pour le type 'bonLivraison'
      this.numero = await numerotationService.getNextNumero('bonLivraison');
    } catch (error) {
      return next(error);
    }
  }
  next();
});


const BonLivraison = mongoose.model('BonLivraison', bonLivraisonSchema);

module.exports = BonLivraison;