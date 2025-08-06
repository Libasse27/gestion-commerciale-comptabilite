// server/models/system/Parametrage.js
// ==============================================================================
//           Modèle Mongoose pour les Paramètres Généraux du Système
//
// Ce modèle stocke tous les paramètres de configuration de l'application
// sous forme de paires clé-valeur. Il offre une approche unifiée et flexible.
// Un administrateur peut modifier ces paramètres via l'interface sans
// nécessiter de nouvelle version de l'application.
// ==============================================================================

const mongoose = require('mongoose');

const parametrageSchema = new mongoose.Schema(
  {
    /**
     * La clé unique et technique du paramètre.
     */
    cle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      immutable: true,
    },

    /**
     * La valeur du paramètre, stockée en chaîne de caractères pour la flexibilité.
     */
    valeur: {
      type: String,
      trim: true,
    },

    /**
     * Une description lisible du paramètre pour l'interface d'administration.
     */
    description: {
      type: String,
      trim: true,
    },

    /**
     * Le type de données de la valeur, pour aider le frontend.
     */
    type: {
      type: String,
      enum: ['Texte', 'Nombre', 'Booleen', 'URL', 'TexteLong', 'JSON'],
      required: true,
      default: 'Texte',
    },
    
    /**
     * Groupe auquel appartient le paramètre, pour l'organisation dans l'interface.
     */
    groupe: {
        type: String,
        enum: ['Entreprise', 'Ventes', 'Stock', 'Comptabilite', 'Fiscalite'],
        required: true,
        default: 'Entreprise',
    },
    
    /**
     * L'utilisateur qui a effectué la dernière modification (pour l'audit).
     */
    modifiePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
  },
  {
    timestamps: true,
    collection: 'system_parametres',
  }
);

parametrageSchema.index({ groupe: 1, cle: 1 });

const Parametrage = mongoose.models.Parametrage || mongoose.model('Parametrage', parametrageSchema);

module.exports = Parametrage;