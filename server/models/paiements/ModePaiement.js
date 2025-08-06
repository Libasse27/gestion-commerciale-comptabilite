// server/models/paiements/ModePaiement.js
const mongoose = require('mongoose');

const modePaiementSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du mode de paiement est obligatoire.'],
      trim: true,
      unique: true,
    },
    type: {
        type: String,
        enum: ['Tresorerie', 'Autre'],
        required: true,
        default: 'Tresorerie',
    },
    compteComptableAssocie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompteComptable',
        default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'paiements_modes',
  }
);

modePaiementSchema.index({ nom: 1 });

const ModePaiement = mongoose.models.ModePaiement || mongoose.model('ModePaiement', modePaiementSchema);

module.exports = ModePaiement;