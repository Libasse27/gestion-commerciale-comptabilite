// ==============================================================================
//           Modèle Mongoose pour les Alertes de Stock
//
// Ce modèle enregistre une alerte chaque fois que le niveau de stock d'un
// produit dans un dépôt passe en dessous de son seuil d'alerte défini.
//
// La création d'un document dans cette collection peut déclencher des
// notifications et permet d'afficher une liste d'alertes actives sur
// le tableau de bord.
// ==============================================================================

const mongoose = require('mongoose');

const alerteStockSchema = new mongoose.Schema(
  {
    /**
     * Le produit concerné par l'alerte.
     */
    produit: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Produit',
      required: true,
    },

    /**
     * Le dépôt où l'alerte a été déclenchée.
     */
    depot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Depot',
      required: true,
    },

    /**
     * Le seuil qui a été franchi.
     */
    seuilAlerte: {
        type: Number,
        required: true,
    },

    /**
     * La quantité en stock au moment où l'alerte a été générée.
     */
    quantiteRestante: {
        type: Number,
        required: true,
    },
    
    /**
     * Le statut de l'alerte.
     * - Active: Le problème n'est pas encore résolu.
     * - Resolue: Le stock a été réapprovisionné au-dessus du seuil.
     * - Ignoree: Un utilisateur a manuellement ignoré l'alerte.
     */
    statut: {
        type: String,
        enum: ['Active', 'Resolue', 'Ignoree'],
        default: 'Active',
    },
    
    /**
     * L'utilisateur qui a résolu ou ignoré l'alerte.
     */
    resoluPar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    dateResolution: {
        type: Date,
    }
  },
  {
    timestamps: true, // `createdAt` indique quand l'alerte a été déclenchée
    collection: 'stock_alertes',
  }
);


// Index pour retrouver rapidement les alertes actives pour un produit/dépôt
alerteStockSchema.index({ produit: 1, depot: 1, statut: 1 });


const AlerteStock = mongoose.model('AlerteStock', alerteStockSchema);

module.exports = AlerteStock;