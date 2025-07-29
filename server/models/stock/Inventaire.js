// ==============================================================================
//           Modèle Mongoose pour les Inventaires de Stock
//
// Ce modèle enregistre les opérations d'inventaire physique des stocks.
// Un inventaire consiste à compter les produits dans un dépôt pour comparer
// le stock physique au stock théorique (informatique).
//
// Les écarts constatés lors d'un inventaire validé déclenchent des
// mouvements de stock d'ajustement.
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Sous-schéma pour les lignes d'un inventaire.
 */
const ligneInventaireSchema = new mongoose.Schema({
  produit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Produit',
    required: true,
  },
  quantiteTheorique: { // Le stock enregistré dans le système au moment de l'inventaire
    type: Number,
    required: true,
  },
  quantitePhysique: { // Le stock réellement compté
    type: Number,
    required: true,
    min: 0,
  },
  ecart: { // La différence (Physique - Théorique)
    type: Number,
    required: true,
  },
}, { _id: false });


/**
 * Schéma principal pour l'Inventaire.
 */
const inventaireSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      required: true,
      unique: true,
      // TODO: Ajouter un hook pour la numérotation automatique (ex: INV-2024-0001)
    },
    depot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Depot',
      required: true,
    },
    dateInventaire: {
      type: Date,
      default: Date.now,
    },
    
    lignes: [ligneInventaireSchema],
    
    statut: {
      type: String,
      enum: ['En cours', 'Validé', 'Annulé'],
      default: 'En cours',
    },
    
    notes: {
        type: String,
        trim: true,
    },
    
    realisePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    validePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    dateValidation: {
      type: Date,
    }
  },
  {
    timestamps: true,
    collection: 'stock_inventaires',
  }
);

// Hook pre-save pour calculer l'écart automatiquement
ligneInventaireSchema.pre('validate', function(next) {
    this.ecart = this.quantitePhysique - this.quantiteTheorique;
    next();
});

const Inventaire = mongoose.model('Inventaire', inventaireSchema);

module.exports = Inventaire;