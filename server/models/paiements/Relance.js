// ==============================================================================
//                Modèle Mongoose pour l'Historique des Relances
//
// Ce modèle enregistre chaque action de relance effectuée pour une facture
// impayée.
//
// Il permet de conserver un historique complet des communications avec le
// client concernant ses retards de paiement, ce qui est essentiel pour le
// suivi commercial et d'éventuels contentieux.
// ==============================================================================

const mongoose = require('mongoose');

const relanceSchema = new mongoose.Schema(
  {
    /**
     * Le client qui a été relancé.
     */
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },

    /**
     * La facture spécifique concernée par cette relance.
     */
    facture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facture',
      required: true,
    },

    /**
     * La date à laquelle la relance a été envoyée.
     */
    dateEnvoi: {
      type: Date,
      default: Date.now,
    },

    /**
     * Le niveau de la relance (ex: 1 pour la 1ère, 2 pour la 2ème).
     * Permet d'adapter le message et le ton de la communication.
     */
    niveau: {
      type: Number,
      required: true,
      min: 1,
    },

    /**
     * La méthode par laquelle la relance a été effectuée.
     */
    methode: {
      type: String,
      enum: ['Email', 'SMS', 'Appel', 'Courrier'],
      default: 'Email',
    },

    /**
     * L'utilisateur qui a déclenché la relance.
     * Peut être null s'il s'agit d'une relance automatique effectuée par le système.
     */
    envoyePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Le système est l'expéditeur par défaut
    },
    
    /**
     * Un champ pour stocker une copie du message envoyé ou des notes.
     */
    notes: {
        type: String,
        trim: true,
    }
  },
  {
    timestamps: true, // Ajoute `createdAt` et `updatedAt`
    collection: 'paiements_relances',
  }
);

// Index pour retrouver rapidement toutes les relances d'une facture
relanceSchema.index({ facture: 1 });

const Relance = mongoose.model('Relance', relanceSchema);

module.exports = Relance;