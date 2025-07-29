// ==============================================================================
//           Modèle Mongoose pour les Modes de Paiement
//
// Ce modèle définit les différents modes de paiement que l'entreprise accepte
// ou utilise (Espèces, Chèque, Virement, Mobile Money, etc.).
//
// Le fait de les stocker en base de données permet à un administrateur
// de les configurer dynamiquement via l'interface de l'application.
// ==============================================================================

const mongoose = require('mongoose');

const modePaiementSchema = new mongoose.Schema(
  {
    /**
     * Le nom du mode de paiement, qui doit être unique.
     * Ex: 'Espèces', 'Virement Bancaire', 'Orange Money', 'Wave'
     */
    nom: {
      type: String,
      required: [true, 'Le nom du mode de paiement est obligatoire.'],
      trim: true,
      unique: true,
    },

    /**
     * Le type de mode de paiement, pour des logiques de gestion spécifiques.
     * - Tresorerie: Banque, Caisse (mouvement financier direct)
     * - Autre: Pour des cas spécifiques qui nécessitent un traitement comptable
     *          différent (ex: carte de crédit, qui passe par un compte de transit).
     */
    type: {
        type: String,
        enum: ['Tresorerie', 'Autre'],
        default: 'Tresorerie',
    },
    
    /**
     * (Optionnel) Le compte comptable de trésorerie associé par défaut.
     * Ex: Le mode de paiement 'Caisse' peut être lié au compte '571 - Caisse'.
     *     Le mode de paiement 'Virement BOA' peut être lié au compte '52101 - BOA'.
     * Cela automatise la saisie comptable.
     */
    compteComptableAssocie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompteComptable',
        default: null,
    },
    
    /**
     * Indique si ce mode de paiement est actuellement utilisable.
     */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    collection: 'paiements_modes',
  }
);


const ModePaiement = mongoose.model('ModePaiement', modePaiementSchema);

module.exports = ModePaiement;