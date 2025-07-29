// ==============================================================================
//                Modèle Mongoose pour les Dépôts de Stock
//
// Ce modèle représente un lieu de stockage physique ou logique pour les produits
// (ex: "Entrepôt Principal", "Boutique Centre-Ville", "Stock Défectueux").
//
// C'est la base du système de gestion multi-dépôts.
// ==============================================================================

const mongoose = require('mongoose');

const depotSchema = new mongoose.Schema(
  {
    /**
     * Le nom du dépôt, qui doit être unique.
     */
    nom: {
      type: String,
      required: [true, 'Le nom du dépôt est obligatoire.'],
      trim: true,
      unique: true,
    },

    /**
     * L'adresse physique du dépôt.
     */
    adresse: {
      type: String,
      trim: true,
    },
    
    /**
     * Type de dépôt, pour une gestion plus fine.
     * - Principal: Dépôt central.
     * - Secondaire: Boutique, point de vente.
     * - Virtuel: Pour des gestions spécifiques (ex: stock en transit, retours).
     */
    type: {
        type: String,
        enum: ['Principal', 'Secondaire', 'Virtuel'],
        default: 'Principal',
    },

    /**
     * Indique si le dépôt est actuellement en service.
     * Un dépôt inactif ne peut plus recevoir ou expédier de stock.
     */
    isActive: {
      type: Boolean,
      default: true,
    },
    
    /**
     * Référence à l'utilisateur qui a créé ce dépôt.
     */
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // Ajoute `createdAt` et `updatedAt`
    collection: 'stock_depots',
  }
);


const Depot = mongoose.model('Depot', depotSchema);

module.exports = Depot;