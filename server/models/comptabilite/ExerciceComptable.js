// server/models/comptabilite/ExerciceComptable.js
const mongoose = require('mongoose');
const AppError = require('../../utils/appError');

const exerciceComptableSchema = new mongoose.Schema(
  {
    annee: { type: Number, required: true, unique: true },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    statut: { type: String, enum: ['Ouvert', 'Clôturé'], default: 'Ouvert' },
    cloturePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dateCloture: { type: Date }
  },
  {
    timestamps: true,
    collection: 'comptabilite_exercices',
  }
);

// HOOK PRE-SAVE optimisé pour la validation des dates
exerciceComptableSchema.pre('save', async function(next) {
    // Ne s'exécute que si les dates ont été modifiées
    if (!this.isModified('dateDebut') && !this.isModified('dateFin')) {
        return next();
    }
    
    // 1. Valider la cohérence interne des dates
    if (this.dateDebut >= this.dateFin) {
        return next(new AppError('La date de début doit être antérieure à la date de fin.', 400));
    }

    // 2. Valider l'absence de chevauchement avec d'autres exercices
    const conflictingExercice = await mongoose.models.ExerciceComptable.findOne({
        _id: { $ne: this._id }, // Exclure le document actuel (pour les mises à jour)
        dateDebut: { $lte: this.dateFin },
        dateFin: { $gte: this.dateDebut }
    });

    if (conflictingExercice) {
        return next(new AppError(`La période se chevauche avec l'exercice existant de ${conflictingExercice.annee}.`, 409));
    }
    
    next();
});


const ExerciceComptable = mongoose.models.ExerciceComptable || mongoose.model('ExerciceComptable', exerciceComptableSchema);

module.exports = ExerciceComptable;