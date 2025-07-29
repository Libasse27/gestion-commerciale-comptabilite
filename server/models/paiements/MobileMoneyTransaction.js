// ==============================================================================
//           Modèle Mongoose pour les Transactions Mobile Money
//
// Ce modèle enregistre les informations brutes et le statut de chaque
// transaction effectuée via une API de Mobile Money (Orange Money, Wave, etc.).
//
// Il sert de journal d'audit pour les transactions externes et est lié au
// modèle `Paiement` qui représente la transaction dans la comptabilité interne.
// ==============================================================================

const mongoose = require('mongoose');

const mobileMoneyTransactionSchema = new mongoose.Schema(
  {
    /**
     * L'identifiant unique de la transaction renvoyé par l'API de l'opérateur.
     * C'est la clé de réconciliation.
     */
    transactionId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /**
     * L'opérateur utilisé pour la transaction.
     */
    operateur: {
        type: String,
        required: true,
        enum: ['OrangeMoney', 'Wave', 'FreeMoney', 'Autre'],
    },

    /**
     * Le type de transaction (ex: un paiement initié par le client, ou un
     * paiement initié par l'entreprise).
     */
    type: {
        type: String,
        required: true,
        enum: ['PaiementClient', 'Remboursement', 'PaiementFournisseur'],
    },

    montant: {
        type: Number,
        required: true,
    },

    frais: {
        type: Number,
        default: 0
    },
    
    /**
     * Le statut de la transaction, tel que retourné par l'API de l'opérateur.
     * C'est un champ crucial pour suivre le cycle de vie de la transaction.
     */
    statutOperateur: {
        type: String,
        required: true,
        enum: ['INITIEE', 'EN_COURS', 'REUSSIE', 'ECHOUEE', 'ANNULEE'],
        default: 'INITIEE',
    },

    /**
     * Référence au paiement interne créé dans notre système lorsque
     * la transaction a réussi.
     */
    paiementInterne: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Paiement',
      default: null,
    },
    
    /**
     * Le numéro de téléphone de l'initiateur ou du destinataire du paiement.
     */
    numeroTelephone: {
        type: String,
    },
    
    /**
     * Champ pour stocker des métadonnées ou la réponse brute de l'API
     * pour le débogage et l'audit.
     */
    metadata: {
        type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: true,
    collection: 'paiements_mobilemoney_transactions',
  }
);


const MobileMoneyTransaction = mongoose.model('MobileMoneyTransaction', mobileMoneyTransactionSchema);

module.exports = MobileMoneyTransaction;