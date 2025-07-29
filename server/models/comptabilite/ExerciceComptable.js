// ==============================================================================
//           Modèle Mongoose pour les Exercices Comptables
//
// Ce modèle définit une période comptable (généralement une année fiscale).
// Il permet de segmenter les données comptables par période et de clôturer
// les exercices pour garantir l'intégrité des données financières.
//
// Une fois qu'un exercice est clôturé, aucune écriture ne peut plus y être
// ajoutée ou modifiée.
// ==============================================================================

const mongoose = require('mongoose');

const exerciceComptableSchema = new mongoose.Schema(
  {
    /**
     * L'année de l'exercice fiscal (ex: 2024).
     * Doit être unique.
     */
    annee: {
      type: Number,
      required: true,
      unique: true,
    },

    /**
     * La date de début de l'exercice.
     */
    dateDebut: {
      type: Date,
      required: true,
    },

    /**
     * La date de fin de l'exercice.
     */
    dateFin: {
      type: Date,
      required: true,
    },
    
    /**
     * Le statut de l'exercice.
     * - Ouvert: Les écritures peuvent être passées dans cet exercice.
     * - Clôturé: L'exercice est verrouillé. Aucune modification n'est possible.
     */
    statut: {
        type: String,
        enum: ['Ouvert', 'Clôturé'],
        default: 'Ouvert',
    },
    
    cloturePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null,
    },
    
    dateCloture: {
        type: Date,
    }
  },
  {
    timestamps: true,
    collection: 'comptabilite_exercices',
  }
);


// --- HOOK PRE-SAVE ---
// Pour s'assurer que la date de début est bien avant la date de fin
// et qu'il n'y a pas de chevauchement avec d'autres exercices.
exerciceComptableSchema.pre('save', async function(next) {
    if (this.isNew || this.isModified('dateDebut') || this.isModified('dateFin')) {
        if (this.dateDebut >= this.dateFin) {
            return next(new Error('La date de début doit être antérieure à la date de fin.'));
        }

        // Vérifier le chevauchement avec d'autres exercices
        const conflictingExercice = await mongoose.model('ExerciceComptable').findOne({
            _id: { $ne: this._id }, // Exclure le document actuel en cas de mise à jour
            $or: [
                { dateDebut: { $lte: this.dateFin, $gte: this.dateDebut } },
                { dateFin: { $lte: this.dateFin, $gte: this.dateDebut } }
            ]
        });

        if (conflictingExercice) {
            return next(new Error(`L'exercice se chevauche avec un exercice existant (année ${conflictingExercice.annee}).`));
        }
    }
    next();
});


const ExerciceComptable = mongoose.model('ExerciceComptable', exerciceComptableSchema);

module.exports = ExerciceComptable;