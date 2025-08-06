// server/models/commercial/Categorie.js
// ==============================================================================
//                Modèle Mongoose pour les Catégories de Produits
// ==============================================================================

const mongoose = require('mongoose');
const AppError = require('../../utils/appError');

const categorieSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom de la catégorie est obligatoire.'],
      trim: true,
      unique: true, // Cette option crée déjà un index unique.
    },
    description: {
      type: String,
      trim: true,
    },
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorie',
        default: null,
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
    isActive: {
        type: Boolean,
        default: true,
    }
  },
  {
    timestamps: true,
    collection: 'commercial_categories',
  }
);


// Hook pour éviter qu'une catégorie soit son propre parent
categorieSchema.pre('save', function(next) {
    if (this.parent && this.parent.equals(this._id)) {
        return next(new AppError('Une catégorie ne peut pas être son propre parent.', 400));
    }
    next();
});

// L'index sur 'nom' est déjà créé par 'unique: true'.
// On ne garde que les index supplémentaires.
categorieSchema.index({ parent: 1 });


const Categorie = mongoose.models.Categorie || mongoose.model('Categorie', categorieSchema);

module.exports = Categorie;