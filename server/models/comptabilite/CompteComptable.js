// server/models/comptabilite/CompteComptable.js
const mongoose = require('mongoose');

const compteComptableSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: [true, 'Le numéro de compte est obligatoire.'],
      // unique: true, // On retire l'option ici
      trim: true,
    },
    libelle: {
      type: String,
      required: [true, 'Le libellé du compte est obligatoire.'],
      trim: true,
    },
    classe: {
        type: Number,
        min: 1, max: 9,
        required: true,
    },
    sens: {
        type: String,
        enum: ['Debit', 'Credit'],
        required: true,
    },
    type: {
        type: String,
        enum: ['Tiers', 'Tresorerie', 'Bilan', 'Resultat', 'Autre'],
        required: true,
    },
    estLettrable: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
  },
  {
    timestamps: true,
    collection: 'comptabilite_plan',
  }
);

compteComptableSchema.pre('save', function(next) {
    if (this.isModified('numero') || this.isNew) {
        if (this.numero && this.numero.length > 0) {
            const classe = parseInt(this.numero.charAt(0), 10);
            if (!isNaN(classe) && classe >= 1 && classe <= 9) {
                this.classe = classe;
            } else {
                return next(new Error("Le numéro de compte doit commencer par un chiffre de 1 à 9."));
            }
        }
    }
    next();
});

// === DÉCLARATION EXPLICITE DES INDEX ===
// On déclare l'index unique ici, ce qui est plus propre
compteComptableSchema.index({ numero: 1 }, { unique: true });
compteComptableSchema.index({ libelle: 'text' });
// =====================================

const CompteComptable = mongoose.models.CompteComptable || mongoose.model('CompteComptable', compteComptableSchema);

module.exports = CompteComptable;