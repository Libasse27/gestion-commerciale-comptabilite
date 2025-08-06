// server/models/stock/Depot.js
// ==============================================================================
//                Modèle Mongoose pour les Dépôts de Stock
// ==============================================================================

const mongoose = require('mongoose');

const depotSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du dépôt est obligatoire.'],
      trim: true,
      // La contrainte d'unicité est maintenant gérée par l'index ci-dessous.
    },
    adresse: {
      type: String,
      trim: true,
    },
    type: {
        type: String,
        enum: ['Principal', 'Secondaire', 'Virtuel'],
        required: true,
        default: 'Principal',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modifiePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
    collection: 'stock_depots',
  }
);

// Déclare un index UNIQUE sur le champ 'nom'.
// C'est maintenant la seule source de vérité pour cet index.
depotSchema.index({ nom: 1 }, { unique: true });

const Depot = mongoose.models.Depot || mongoose.model('Depot', depotSchema);

module.exports = Depot;