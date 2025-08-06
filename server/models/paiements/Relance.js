// server/models/paiements/Relance.js
// ==============================================================================
//                Modèle Mongoose pour l'Historique des Relances
//
// Ce modèle enregistre chaque action de relance effectuée pour une facture
// impayée, permettant de conserver un historique complet des communications.
// ==============================================================================

const mongoose = require('mongoose');

const relanceSchema = new mongoose.Schema(
  {
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    facture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facture',
      required: true,
    },
    niveau: {
      type: Number,
      required: true,
      min: 1,
    },
    methode: {
      type: String,
      enum: ['Email', 'SMS', 'Appel', 'Courrier'],
      required: true,
      default: 'Email',
    },
    envoyePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // null signifie "Système"
    },
    notes: {
        type: String,
        trim: true,
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'paiements_relances',
  }
);

relanceSchema.index({ facture: 1, createdAt: -1 });
relanceSchema.index({ client: 1, createdAt: -1 });

const Relance = mongoose.models.Relance || mongoose.model('Relance', relanceSchema);

module.exports = Relance;