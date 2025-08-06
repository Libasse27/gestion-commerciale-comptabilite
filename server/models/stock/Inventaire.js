// server/models/stock/Inventaire.js
const mongoose = require('mongoose');
const numerotationService = require('../../services/system/numerotationService');
const { roundTo } = require('../../utils/numberUtils');

const ligneInventaireSchema = new mongoose.Schema({
  produit: { type: mongoose.Schema.Types.ObjectId, ref: 'Produit', required: true },
  quantiteTheorique: { type: Number, required: true, min: 0 },
  quantitePhysique: { type: Number, required: true, min: 0 },
  ecart: { type: Number, required: true, default: 0 },
}, { _id: false });


const inventaireSchema = new mongoose.Schema(
  {
    numero: { type: String, unique: true, trim: true, uppercase: true },
    depot: { type: mongoose.Schema.Types.ObjectId, ref: 'Depot', required: true },
    dateInventaire: { type: Date, default: Date.now },
    lignes: [ligneInventaireSchema],
    statut: { type: String, enum: ['En cours', 'Validé', 'Annulé'], default: 'En cours' },
    notes: { type: String, trim: true },
    realisePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    validePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dateValidation: { type: Date },
  },
  {
    timestamps: true,
    collection: 'stock_inventaires',
  }
);

// Hook pour calculer l'écart avant toute opération de sauvegarde/validation
inventaireSchema.pre('validate', function(next) {
    if (this.isModified('lignes') || this.isNew) {
        this.lignes.forEach(ligne => {
            ligne.ecart = roundTo(ligne.quantitePhysique - ligne.quantiteTheorique);
        });
    }
    next();
});

// Hook pour la numérotation automatique
inventaireSchema.pre('save', async function(next) {
  if (this.isNew && !this.numero) {
    try {
      this.numero = await numerotationService.getNextNumero('inventaire');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

inventaireSchema.index({ depot: 1, dateInventaire: -1 });

const Inventaire = mongoose.models.Inventaire || mongoose.model('Inventaire', inventaireSchema);

module.exports = Inventaire;