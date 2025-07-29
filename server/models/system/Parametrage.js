// ==============================================================================
//           Modèle Mongoose pour les Paramètres Généraux du Système
//
// Ce modèle stocke les paramètres de configuration généraux de l'application
// sous forme de paires clé-valeur.
//
// Il permet de configurer le comportement de l'application et de personnaliser
// les informations de l'entreprise (nom, adresse, logo) qui apparaissent sur
// les documents, sans avoir à modifier le code.
// ==============================================================================

const mongoose = require('mongoose');

const parametrageSchema = new mongoose.Schema(
  {
    /**
     * La clé unique et technique du paramètre.
     * Ex: 'NOM_ENTREPRISE', 'ADRESSE_ENTREPRISE', 'LOGO_URL', 'STOCK_NEGATIF_AUTORISE'
     */
    cle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true, // Bonne pratique pour les clés
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
     * Le type de données de la valeur, pour aider le frontend à afficher
     * le bon type de champ de saisie (texte, switch, etc.).
     */
    type: {
      type: String,
      enum: ['Texte', 'Nombre', 'Booleen', 'URL', 'JSON'],
      default: 'Texte',
    },
    
    /**
     * Groupe auquel appartient le paramètre, pour l'organisation dans l'interface.
     */
    groupe: {
        type: String,
        enum: ['Entreprise', 'Ventes', 'Stock', 'Comptabilite'],
        default: 'Entreprise',
    },
    
    /**
     * L'utilisateur qui a effectué la dernière modification.
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

const Parametrage = mongoose.model('Parametrage', parametrageSchema);

module.exports = Parametrage;