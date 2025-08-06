// server/models/comptabilite/Budget.js
const mongoose = require('mongoose');
const AppError = require('../../utils/appError');

const ligneBudgetSchema = new mongoose.Schema({
  compteComptable: { type: mongoose.Schema.Types.ObjectId, ref: 'CompteComptable', required: true },
  montantPrevu: { type: Number, required: true, default: 0, min: 0 },
}, { _id: false });

const budgetSchema = new mongoose.Schema(
  {
    nom: { type: String, required: [true, 'Le nom du budget est obligatoire.'], trim: true, unique: true },
    exercice: { type: mongoose.Schema.Types.ObjectId, ref: 'ExerciceComptable', required: true },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    lignes: [ligneBudgetSchema],
    statut: { type: String, enum: ['Brouillon', 'Approuvé', 'Archivé'], default: 'Brouillon' },
    creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    approuvePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    collection: 'comptabilite_budgets',
  }
);

// HOOK PRE-SAVE optimisé pour la validation des dates
budgetSchema.pre('save', async function(next) {
    if (!this.isModified('dateDebut') && !this.isModified('dateFin') && !this.isModified('exercice')) {
        return next();
    }
    
    if (this.dateDebut >= this.dateFin) {
        return next(new AppError("La date de début du budget doit être antérieure à sa date de fin.", 400));
    }

    const exercice = await mongoose.model('ExerciceComptable').findById(this.exercice).lean();
    if (!exercice) {
        return next(new AppError("L'exercice comptable associé est introuvable.", 400));
    }
    if (this.dateDebut < exercice.dateDebut || this.dateFin > exercice.dateFin) {
        return next(new AppError("La période du budget doit être incluse dans les dates de l'exercice comptable.", 400));
    }

    next();
});

budgetSchema.index({ exercice: 1, nom: 1 });

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

module.exports = Budget;