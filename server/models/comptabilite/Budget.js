// ==============================================================================
//           Modèle Mongoose pour la Gestion Budgétaire
//
// Ce modèle permet de définir des budgets prévisionnels pour des comptes
// comptables sur des périodes spécifiques (généralement mensuelles ou annuelles).
//
// Il est la base du suivi budgétaire, permettant de comparer les montants
// réels (issus des écritures) avec les montants prévus.
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Sous-schéma pour les lignes budgétaires.
 * Chaque ligne représente le budget alloué à un compte pour une période.
 */
const ligneBudgetSchema = new mongoose.Schema({
  compte: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompteComptable',
    required: true,
  },
  montantPrevu: {
    type: Number,
    required: true,
    default: 0,
  },
  
  // Les champs ci-dessous ne sont pas stockés mais pourraient être calculés
  // pour des rapports :
  // montantRealise: { type: Number },
  // ecart: { type: Number },
}, { _id: false });


/**
 * Schéma principal pour le Budget.
 */
const budgetSchema = new mongoose.Schema(
  {
    /**
     * Nom du budget (ex: "Budget Marketing 2024", "Budget Opérationnel Q3").
     */
    nom: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    /**
     * L'exercice comptable auquel ce budget est rattaché.
     */
    exercice: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExerciceComptable',
      required: true,
    },
    
    /**
     * Dates de la période couverte par le budget.
     * Doivent être comprises dans les dates de l'exercice.
     */
    dateDebut: {
      type: Date,
      required: true,
    },
    dateFin: {
      type: Date,
      required: true,
    },

    /**
     * Lignes budgétaires détaillant les prévisions par compte.
     */
    lignes: [ligneBudgetSchema],

    statut: {
      type: String,
      enum: ['Brouillon', 'Approuvé', 'Archivé'],
      default: 'Brouillon',
    },
    
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    approuvePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    }
  },
  {
    timestamps: true,
    collection: 'comptabilite_budgets',
  }
);


// --- HOOK PRE-SAVE ---
// Pour valider que la période du budget est bien incluse dans son exercice.
budgetSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('dateDebut') || this.isModified('dateFin') || this.isModified('exercice')) {
        const exercice = await mongoose.model('ExerciceComptable').findById(this.exercice);
        if (!exercice) {
            return next(new Error('L\'exercice comptable associé est introuvable.'));
        }
        if (this.dateDebut < exercice.dateDebut || this.dateFin > exercice.dateFin) {
            return next(new Error('La période du budget doit être incluse dans les dates de l\'exercice comptable.'));
        }
    }
    next();
});

const Budget = mongoose.model('Budget', budgetSchema);

module.exports = Budget;