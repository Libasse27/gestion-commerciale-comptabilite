// ==============================================================================
//                Modèle Mongoose pour les Catégories de Produits
//
// Ce modèle définit la structure des catégories qui permettent d'organiser
// le catalogue de produits et services.
//
// Il inclut une référence à une catégorie parente pour permettre une
// structure hiérarchique (catégories et sous-catégories).
// ==============================================================================

const mongoose = require('mongoose');

const categorieSchema = new mongoose.Schema(
  {
    /**
     * Le nom de la catégorie.
     */
    nom: {
      type: String,
      required: [true, 'Le nom de la catégorie est obligatoire.'],
      trim: true,
      unique: true,
    },

    /**
     * Une description de la catégorie.
     */
    description: {
      type: String,
      trim: true,
    },
    
    /**
     * Référence à une catégorie parente.
     * Si ce champ est null, c'est une catégorie de premier niveau.
     * S'il contient un ID, c'est une sous-catégorie.
     */
    parent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Categorie', // Fait référence à lui-même (self-referencing)
        default: null,
    },
    
    /**
     * Référence à l'utilisateur qui a créé cette catégorie.
     */
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    isActive: {
        type: Boolean,
        default: true,
    }
  },
  {
    timestamps: true, // Ajoute `createdAt` et `updatedAt`
    collection: 'commercial_categories',
  }
);


// Pour éviter qu'une catégorie soit son propre parent (ce qui créerait une boucle infinie)
categorieSchema.pre('save', function(next) {
    if (this.parent && this.parent.equals(this._id)) {
        const err = new Error('Une catégorie ne peut pas être son propre parent.');
        next(err);
    } else {
        next();
    }
});


const Categorie = mongoose.model('Categorie', categorieSchema);

module.exports = Categorie;