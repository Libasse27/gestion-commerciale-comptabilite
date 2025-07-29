// ==============================================================================
//                Modèle Mongoose pour l'État du Stock
//
// Ce modèle est le cœur du système de gestion des stocks. Il ne représente
// pas un objet physique, mais une LIAISON entre un Produit et un Dépôt,
// en spécifiant la quantité disponible.
//
// Chaque document de cette collection signifie :
// "Le Produit X a une quantité de Y dans le Dépôt Z".
//
// Un index unique sur la paire (produit, depot) garantit qu'il ne peut y
// avoir qu'une seule entrée de stock pour un produit donné dans un dépôt.
// ==============================================================================

const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema(
  {
    /**
     * Référence au produit concerné.
     */
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },

    /**
     * Référence au dépôt où le stock est situé.
     */
    depot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Depot',
      required: true,
    },
    
    /**
     * La quantité de ce produit actuellement disponible dans ce dépôt.
     */
    quantite: {
        type: Number,
        required: true,
        default: 0,
        min: [0, 'La quantité en stock ne peut pas être négative.'],
    },
    
    /**
     * (Optionnel) Emplacement spécifique dans le dépôt (ex: Allée 5, Rayon B).
     */
    emplacement: {
        type: String,
        trim: true,
    },

    /**
     * (Optionnel) Seuil d'alerte spécifique pour ce produit dans ce dépôt.
     * Peut surcharger le seuil défini sur la fiche produit.
     */
    seuilAlerte: {
        type: Number,
        default: 0,
    }
  },
  {
    timestamps: true, // `updatedAt` est très utile pour savoir quand le stock a bougé pour la dernière fois
    collection: 'stock_etats',
  }
);


// --- INDEX UNIQUE ---
// C'est l'index le plus important de ce modèle.
// Il garantit qu'il ne peut y avoir qu'UNE SEULE ligne de stock pour
// une combinaison unique de produit et de dépôt.
stockSchema.index({ produit: 1, depot: 1 }, { unique: true });


const Stock = mongoose.model('Stock', stockSchema);

module.exports = Stock;