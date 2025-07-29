// ==============================================================================
//           Modèle Mongoose pour les Transactions de Paiement
//
// Ce modèle enregistre chaque transaction financière, qu'il s'agisse d'un
// encaissement client ou d'un décaissement fournisseur.
//
// Il est au cœur de la gestion de la trésorerie et permet de lier les
// mouvements financiers aux documents commerciaux (factures).
// ==============================================================================

const mongoose = require('mongoose');
const { PAYMENT_METHODS } = require('../../utils/constants');

/**
 * Sous-schéma pour l'imputation du paiement sur une ou plusieurs factures.
 */
const imputationSchema = new mongoose.Schema({
    facture: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'typeTiersModel' // Référence dynamique à Facture ou FactureAchat
    },
    montantImpute: {
        type: Number,
        required: true,
    }
}, { _id: false });


const paiementSchema = new mongoose.Schema(
  {
    /**
     * Référence de paiement interne ou externe (ex: N° de chèque, ID de transaction).
     */
    reference: {
      type: String,
      required: true,
      unique: true,
      // TODO: Hook de numérotation automatique (ex: PAY-2024-0001)
    },
    
    datePaiement: {
      type: Date,
      required: true,
      default: Date.now,
    },

    /**
     * Le montant total de la transaction.
     */
    montant: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) { return v > 0; },
            message: 'Le montant d\'un paiement doit être positif.'
        }
    },
    
    /**
     * Le sens de la transaction.
     */
    sens: {
        type: String,
        required: true,
        enum: ['Entrant', 'Sortant'], // Entrant = encaissement, Sortant = décaissement
    },
    
    /**
     * Le tiers (client ou fournisseur) concerné par le paiement.
     */
    tiers: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'tiersModel',
    },
    tiersModel: {
        type: String,
        required: true,
        enum: ['Client', 'Fournisseur'],
    },
    
    modePaiement: {
       type: mongoose.Schema.Types.ObjectId,
       ref: 'ModePaiement',
       required: true,
    },
    
    /**
     * Le compte de trésorerie (Banque, Caisse) affecté par le paiement.
     */
    compteTresorerie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompteComptable',
        required: true,
    },
    
    /**
     * Détail de l'imputation du paiement sur les factures.
     * Un paiement peut régler plusieurs factures.
     */
    imputations: [imputationSchema],
    
    statut: {
        type: String,
        enum: ['Non rapproché', 'Rapproché'],
        default: 'Non rapproché',
    },

    enregistrePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'paiements_transactions',
  }
);

// Référence dynamique pour l'imputation
// Le modèle de la facture dépend si le tiers est un Client ou un Fournisseur
paiementSchema.virtual('typeTiersModel').get(function() {
    return this.tiersModel === 'Client' ? 'Facture' : 'FactureAchat';
});


const Paiement = mongoose.model('Paiement', paiementSchema);

module.exports = Paiement;