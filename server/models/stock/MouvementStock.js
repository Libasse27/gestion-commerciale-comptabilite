// ==============================================================================
//           Modèle Mongoose pour les Mouvements de Stock (Journal)
//
// Ce modèle est le journal de toutes les transactions de stock. Chaque
// document représente une entrée ou une sortie de stock atomique.
//
// Il assure une traçabilité et une auditabilité complètes des niveaux de stock.
// En théorie, la somme de tous les mouvements pour un produit dans un dépôt
// devrait être égale à la quantité actuelle dans le modèle `Stock`.
//
// Les documents de cette collection sont immuables : on les crée, mais on
// ne les modifie jamais. Pour corriger une erreur, on crée un nouveau
// mouvement inverse.
// ==============================================================================

const mongoose = require('mongoose');
const { STOCK_MOVEMENT_TYPES } = require('../../utils/constants');

const mouvementStockSchema = new mongoose.Schema(
  {
    /**
     * Le produit concerné par le mouvement.
     */
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },

    /**
     * Le dépôt concerné par le mouvement.
     */
    depot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Depot',
      required: true,
    },
    
    /**
     * Le type de mouvement (entrée, sortie, ajustement, etc.).
     */
    type: {
        type: String,
        required: true,
        enum: Object.values(STOCK_MOVEMENT_TYPES),
    },
    
    /**
     * La quantité déplacée. C'est toujours une valeur positive.
     * Le `type` de mouvement détermine si c'est une addition ou une soustraction.
     */
    quantite: {
        type: Number,
        required: true,
        validate: {
            validator: function(v) { return v > 0; },
            message: 'La quantité d\'un mouvement doit être positive.'
        }
    },

    /**
     * Le stock avant et après le mouvement, pour un audit facile.
     */
    stockAvant: { type: Number, required: true },
    stockApres: { type: Number, required: true },

    /**
     * Référence au document qui a déclenché le mouvement (pour la traçabilité).
     */
    referenceDocument: {
        type: String, // ex: 'Facture FAC-2024-0123', 'Inventaire INV-2024-004'
        trim: true,
    },
    documentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'documentModel' // Référence dynamique
    },
    documentModel: {
        type: String,
        enum: ['Facture', 'BonLivraison', 'Inventaire'] // Les modèles possibles
    },

    /**
     * L'utilisateur responsable du mouvement.
     */
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'stock_mouvements',
  }
);


// Index pour accélérer la recherche des mouvements d'un produit/dépôt
mouvementStockSchema.index({ produit: 1, depot: 1, createdAt: -1 });


const MouvementStock = mongoose.model('MouvementStock', mouvementStockSchema);

module.exports = MouvementStock;