// server/models/fiscal/DeclarationFiscale.js
const mongoose = require('mongoose');
const { roundTo } = require('../../utils/numberUtils');

const declarationTVASchema = new mongoose.Schema(
  {
    periode: {
      type: String,
      required: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Le format de la période doit être AAAA-MM'],
    },
    dateDeclaration: { 
      type: Date,
      default: Date.now 
    },
    tvaCollectee: { type: Number, required: true, default: 0, min: 0 },
    tvaDeductible: { type: Number, required: true, default: 0, min: 0 },
    creditTvaAnterieur: { type: Number, required: true, default: 0, min: 0 },
    tvaAPayer: { type: Number, default: 0, min: 0 },
    creditTvaAReporter: { type: Number, default: 0, min: 0 },
    statut: {
      type: String,
      enum: ['Brouillon', 'Déclarée'],
      default: 'Brouillon',
    },
    declarePar: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  {
    timestamps: true,
    collection: 'fiscal_declarations_tva',
  }
);

declarationTVASchema.pre('save', function(next) {
    if (this.isModified('tvaCollectee') || this.isModified('tvaDeductible') || this.isModified('creditTvaAnterieur')) {
        const tvaDue = this.tvaCollectee - (this.tvaDeductible + this.creditTvaAnterieur);
        
        if (tvaDue > 0) {
            this.tvaAPayer = roundTo(tvaDue, 0);
            this.creditTvaAReporter = 0;
        } else {
            this.tvaAPayer = 0;
            this.creditTvaAReporter = roundTo(-tvaDue, 0);
        }
    }
    next();
});

// Index unique et trié pour la période
declarationTVASchema.index({ periode: -1 }, { unique: true });

const DeclarationTVA = mongoose.models.DeclarationTVA || mongoose.model('DeclarationTVA', declarationTVASchema);

module.exports = DeclarationTVA;