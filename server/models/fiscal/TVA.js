// ==============================================================================
//           Modèle Mongoose pour le Registre des Transactions de TVA
//
// Ce modèle enregistre chaque transaction individuelle de TVA (collectée ou
// déductible) au moment où elle est comptabilisée.
//
// Il s'agit d'une forme de dénormalisation : ces données existent déjà dans
// les factures, mais les stocker ici peut accélérer la génération de certains
// rapports fiscaux très détaillés.
//
// !! ATTENTION !!
// Maintenir cette collection synchronisée avec les factures ajoute de la
// complexité. À n'utiliser que si les agrégations directes sur les factures
// ne sont pas assez performantes.
// ==============================================================================

const mongoose = require('mongoose');

const tvaSchema = new mongoose.Schema(
  {
    /**
     * La date de l'opération (généralement la date de la facture).
     */
    date: {
      type: Date,
      required: true,
    },

    /**
     * Le type de TVA : collectée sur une vente ou déductible sur un achat.
     */
    type: {
      type: String,
      required: true,
      enum: ['Collectee', 'Deductible'],
    },

    /**
     * Le montant de la base Hors Taxes sur lequel la TVA a été calculée.
     */
    baseHT: {
      type: Number,
      required: true,
    },
    
    /**
     * Le taux de TVA appliqué.
     */
    taux: {
        type: Number,
        required: true,
    },
    
    /**
     * Le montant de la TVA calculé.
     */
    montant: {
        type: Number,
        required: true,
    },

    /**
     * Le compte comptable de TVA qui a été mouvementé.
     */
    compteComptable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompteComptable',
        required: true,
    },
    
    /**
     * Référence au document source pour la traçabilité.
     */
    sourceDocumentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'sourceDocumentModel',
        required: true,
    },
    sourceDocumentModel: {
        type: String,
        enum: ['Facture', 'FactureAchat'],
        required: true,
    },
    
  },
  {
    timestamps: true,
    collection: 'fiscal_tva_transactions',
  }
);

// Index pour accélérer les recherches par période et par type
tvaSchema.index({ date: 1, type: 1 });


const TVA = mongoose.model('TVA', tvaSchema);

module.exports = TVA;