// server/models/comptabilite/Journal.js
const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Le code du journal est obligatoire.'],
      trim: true,
      uppercase: true,
      // La contrainte d'unicité est maintenant gérée par l'index ci-dessous.
    },
    libelle: {
      type: String,
      required: [true, 'Le libellé du journal est obligatoire.'],
      trim: true,
    },
    type: {
        type: String,
        required: true,
        enum: ['Vente', 'Achat', 'Tresorerie', 'Operations Diverses'],
    },
    compteContrepartie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompteComptable',
        default: null,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
  },
  {
    timestamps: true,
    collection: 'comptabilite_journaux',
  }
);

// Déclare un index UNIQUE sur le champ 'code'.
// C'est maintenant la seule source de vérité pour cet index.
journalSchema.index({ code: 1 }, { unique: true });

const Journal = mongoose.models.Journal || mongoose.model('Journal', journalSchema);

module.exports = Journal;