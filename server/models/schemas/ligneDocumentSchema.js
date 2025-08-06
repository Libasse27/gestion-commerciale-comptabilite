// server/models/schemas/ligneDocumentSchema.js
const mongoose = require('mongoose');

const ligneDocumentSchema = new mongoose.Schema({
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: [true, "Une référence de produit est obligatoire."]
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  quantite: {
    type: Number,
    required: true,
    min: [0.01, 'La quantité doit être positive.'],
    default: 1,
  },
  prixUnitaireHT: {
    type: Number,
    required: true,
    min: [0, 'Le prix unitaire ne peut pas être négatif.'],
  },
  tauxTVA: {
    type: Number,
    required: true,
    min: [0, 'Le taux de TVA ne peut pas être négatif.'],
    default: 18,
  },
  tauxRemise: {
    type: Number,
    min: [0, 'Le taux de remise ne peut être négatif.'],
    max: [100, 'Le taux de remise ne peut excéder 100%.'],
    default: 0,
  },
  
  // --- Champs Calculés (stockés pour la performance et la clarté) ---
  montantRemise: {
    type: Number,
    required: true,
    default: 0
  },
  montantTVA: {
    type: Number,
    required: true,
    default: 0
  },
  totalHT: {
    type: Number,
    required: true,
  },
  totalTTC: {
    type: Number,
    required: true,
  },
}, { 
  _id: false
});

module.exports = ligneDocumentSchema;