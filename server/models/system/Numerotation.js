// server/models/system/Numerotation.js
// ==============================================================================
//           Modèle Mongoose pour la Gestion de la Numérotation
//
// Ce modèle permet de configurer des schémas de numérotation complexes
// et personnalisables pour chaque type de document.
// ==============================================================================

const mongoose = require('mongoose');

const numerotationSchema = new mongoose.Schema(
  {
    typeDocument: {
      type: String,
      required: [true, 'Le type de document est obligatoire.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    format: {
      type: String,
      required: true,
      default: '{PREFIX}-{AAAA}-{SEQ}',
      trim: true,
    },
    prefixe: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
    },
    longueurSequence: {
      type: Number,
      required: true,
      default: 4,
      min: 1,
    },
    derniereSequence: {
      type: Number,
      default: 0,
    },
    resetSequence: {
        type: String,
        enum: ['Annuelle', 'Mensuelle', null],
        default: 'Annuelle',
    },
    derniereAnneeReset: { type: Number },
    dernierMoisReset: { type: Number },
  },
  {
    timestamps: true,
    collection: 'system_numerotations',
  }
);

const Numerotation = mongoose.models.Numerotation || mongoose.model('Numerotation', numerotationSchema);

module.exports = Numerotation;