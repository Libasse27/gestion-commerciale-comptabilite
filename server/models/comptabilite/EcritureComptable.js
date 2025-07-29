// ==============================================================================
//           Modèle Mongoose pour les Écritures Comptables
//
// MISE À JOUR : Ajout d'une référence à l'Exercice Comptable pour rattacher
// chaque écriture à une période fiscale.
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Sous-schéma pour les lignes d'une écriture comptable (mouvements).
 */
const ligneEcritureSchema = new mongoose.Schema({
  compte: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompteComptable',
    required: true,
  },
  libelle: {
    type: String,
    trim: true,
    required: true,
  },
  debit: {
    type: Number,
    default: 0,
    min: 0,
  },
  credit: {
    type: Number,
    default: 0,
    min: 0,
  },
}, { _id: false });


/**
 * Schéma principal pour l'Écriture Comptable.
 */
const ecritureComptableSchema = new mongoose.Schema(
  {
    numeroPiece: {
      type: String,
      required: true,
      unique: true,
      // TODO: Ajouter un hook pour la numérotation automatique
    },

    /**
     * Référence à l'exercice comptable auquel cette écriture appartient.
     * Champ essentiel pour la clôture et les rapports.
     */
    exercice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExerciceComptable',
      required: [true, 'L\'écriture doit être rattachée à un exercice comptable.'],
    },

    journal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Journal',
      required: true,
    },
    
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },

    libelle: {
      type: String,
      required: true,
      trim: true,
    },

    lignes: {
      type: [ligneEcritureSchema],
      validate: [
        {
          validator: function(lignes) { return lignes.length >= 2; },
          message: 'Une écriture doit contenir au moins deux lignes.'
        },
        {
          validator: function(lignes) {
            const totalDebit = lignes.reduce((sum, l) => sum + (l.debit || 0), 0);
            const totalCredit = lignes.reduce((sum, l) => sum + (l.credit || 0), 0);
            return Math.abs(totalDebit - totalCredit) < 0.01;
          },
          message: 'L\'écriture n\'est pas équilibrée : la somme des débits doit être égale à la somme des crédits.'
        }
      ]
    },
    
    totalDebit: { type: Number, required: true },
    totalCredit: { type: Number, required: true },

    statut: {
      type: String,
      enum: ['Brouillard', 'Validée'],
      default: 'Brouillard',
    },
    
    sourceDocumentId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'sourceDocumentModel'
    },
    sourceDocumentModel: {
        type: String,
        enum: ['Facture', 'FactureAchat', 'Paiement']
    },

    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    validePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  {
    timestamps: true,
    collection: 'comptabilite_ecritures',
  }
);


// --- HOOK PRE-SAVE ---
ecritureComptableSchema.pre('validate', function(next) {
    if (this.isModified('lignes') || this.isNew) {
        this.totalDebit = this.lignes.reduce((sum, l) => sum + (l.debit || 0), 0);
        this.totalCredit = this.lignes.reduce((sum, l) => sum + (l.credit || 0), 0);
    }
    // TODO: Ajouter une validation pour s'assurer que la `date` de l'écriture
    // tombe bien dans les `dateDebut` et `dateFin` de l' `exercice` associé.
    next();
});

const EcritureComptable = mongoose.model('EcritureComptable', ecritureComptableSchema);

module.exports = EcritureComptable;