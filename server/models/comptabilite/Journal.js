// ==============================================================================
//           Modèle Mongoose pour les Journaux Comptables
//
// Ce modèle définit les différents journaux dans lesquels les écritures
// comptables seront enregistrées.
//
// Chaque journal (Ventes, Achats, Banque, Caisse, Opérations Diverses) a un
// code unique et peut être associé à des comptes par défaut pour faciliter
// et automatiser la saisie.
// ==============================================================================

const mongoose = require('mongoose');

const journalSchema = new mongoose.Schema(
  {
    /**
     * Le code du journal, unique et généralement court (2 à 4 lettres).
     * Ex: 'VE' pour Ventes, 'AC' pour Achats, 'BQ' pour Banque.
     */
    code: {
      type: String,
      required: [true, 'Le code du journal est obligatoire.'],
      unique: true,
      trim: true,
      uppercase: true,
    },

    /**
     * L'intitulé complet du journal.
     */
    libelle: {
      type: String,
      required: [true, 'Le libellé du journal est obligatoire.'],
      trim: true,
    },
    
    /**
     * Le type de journal, pour des logiques de gestion spécifiques.
     * Cette information est cruciale pour l'automatisation.
     */
    type: {
        type: String,
        required: true,
        enum: ['Vente', 'Achat', 'Tresorerie', 'Operations Diverses'],
    },
    
    /**
     * (Optionnel) Compte de contrepartie par défaut.
     * Ex: Pour un journal de Banque, le compte de contrepartie sera le compte 521 (Banque).
     * Quand on enregistrera un paiement, le système saura automatiquement créditer ce compte.
     */
    compteContrepartie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompteComptable',
        default: null,
    },
    
    isActive: {
        type: Boolean,
        default: true,
    }
  },
  {
    timestamps: true,
    collection: 'comptabilite_journaux',
  }
);


const Journal = mongoose.model('Journal', journalSchema);

module.exports = Journal;