// ==============================================================================
//           Modèle Mongoose pour les Paramètres Fiscaux
//
// Ce modèle stocke les paramètres fiscaux clés de l'application (ex: taux
// de TVA par défaut) sous forme de paires clé-valeur.
//
// Le fait de stocker ces paramètres en base de données plutôt qu'en dur
// dans le code permet une plus grande flexibilité. Un administrateur peut
// les modifier via l'interface sans nécessiter une nouvelle version de
// l'application.
// ==============================================================================

const mongoose = require('mongoose');

const parametreFiscalSchema = new mongoose.Schema(
  {
    /**
     * La clé unique du paramètre (non modifiable après création).
     * Ex: 'TAUX_TVA_DEFAUT', 'CODE_REGIME_FISCAL'
     */
    cle: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      uppercase: true,
      immutable: true, // Empêche la modification de la clé après la création
    },

    /**
     * La valeur du paramètre.
     * Stockée en chaîne de caractères pour plus de flexibilité (peut être
     * un nombre, un texte, un JSON...). La conversion se fait au niveau du service.
     */
    valeur: {
      type: String,
      required: true,
      trim: true,
    },

    /**
     * Une description lisible de ce que représente le paramètre et son impact.
     */
    description: {
      type: String,
      trim: true,
    },

    /**
     * Le type de données de la valeur, pour aider le frontend à afficher le
     * bon type de champ de saisie et pour le backend à parser correctement la valeur.
     */
    type: {
      type: String,
      enum: ['Nombre', 'Texte', 'Booleen', 'JSON'],
      required: true,
      default: 'Texte',
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
    timestamps: true, // `updatedAt` est important pour savoir quand le paramètre a changé
    collection: 'fiscal_parametres',
  }
);


const ParametreFiscal = mongoose.models.ParametreFiscal || mongoose.model('ParametreFiscal', parametreFiscalSchema);

module.exports = ParametreFiscal;