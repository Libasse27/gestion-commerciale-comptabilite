// server/models/comptabilite/EcritureComptable.js
const mongoose = require('mongoose');
const numerotationService = require('../../services/system/numerotationService');
const AppError = require('../../utils/appError');
const { roundTo } = require('../../utils/numberUtils');

const ligneEcritureSchema = new mongoose.Schema({
  compte: { type: mongoose.Schema.Types.ObjectId, ref: 'CompteComptable', required: true },
  libelle: { type: String, trim: true, required: true },
  debit: { type: Number, default: 0, min: 0 },
  credit: { type: Number, default: 0, min: 0 },
}, { _id: false });

const ecritureComptableSchema = new mongoose.Schema(
  {
    numeroPiece: { type: String, unique: true, trim: true, uppercase: true },
    exercice: { type: mongoose.Schema.Types.ObjectId, ref: 'ExerciceComptable', required: true },
    journal: { type: mongoose.Schema.Types.ObjectId, ref: 'Journal', required: true },
    date: { type: Date, required: true, default: Date.now },
    libelle: { type: String, required: true, trim: true },
    lignes: {
      type: [ligneEcritureSchema],
      validate: [
        { validator: (l) => l.length >= 2, msg: 'Une écriture doit contenir au moins deux lignes.' },
        {
          validator: function(lignes) {
            const totalDebit = lignes.reduce((sum, l) => sum + (l.debit || 0), 0);
            const totalCredit = lignes.reduce((sum, l) => sum + (l.credit || 0), 0);
            return Math.abs(roundTo(totalDebit) - roundTo(totalCredit)) < 0.01;
          },
          message: "L'écriture n'est pas équilibrée : la somme des débits doit être égale à la somme des crédits."
        }
      ]
    },
    totalDebit: { type: Number, required: true },
    totalCredit: { type: Number, required: true },
    statut: { type: String, enum: ['Brouillard', 'Validée'], default: 'Brouillard' },
    sourceDocumentId: { type: mongoose.Schema.Types.ObjectId, refPath: 'sourceDocumentModel' },
    sourceDocumentModel: { type: String, enum: ['Facture', 'FactureAchat', 'Paiement'] },
    creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    validePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  },
  {
    timestamps: true,
    collection: 'comptabilite_ecritures',
  }
);

ecritureComptableSchema.pre('validate', async function(next) {
    if (this.isModified('lignes') || this.isNew) {
        this.totalDebit = roundTo(this.lignes.reduce((sum, l) => sum + (l.debit || 0), 0));
        this.totalCredit = roundTo(this.lignes.reduce((sum, l) => sum + (l.credit || 0), 0));
    }

    if (this.isModified('date') || this.isModified('exercice') || this.isNew) {
        const exercice = await mongoose.model('ExerciceComptable').findById(this.exercice).lean();
        if (!exercice) return next(new AppError("L'exercice comptable associé est introuvable.", 400));
        if (exercice.statut === 'Clôturé') return next(new AppError(`L'exercice ${exercice.annee} est clôturé. Aucune écriture ne peut y être ajoutée.`, 403));
        if (this.date < exercice.dateDebut || this.date > exercice.dateFin) {
            return next(new AppError(`La date de l'écriture (${this.date.toLocaleDateString()}) est en dehors des bornes de l'exercice selectionné.`, 400));
        }
    }
    next();
});

ecritureComptableSchema.pre('save', async function(next) {
    if (this.isNew && !this.numeroPiece) {
        try {
            this.numeroPiece = await numerotationService.getNextNumero('ecriture_comptable');
        } catch (error) {
            return next(error);
        }
    }
    next();
});

ecritureComptableSchema.index({ journal: 1, date: -1 });
ecritureComptableSchema.index({ exercice: 1 });

const EcritureComptable = mongoose.models.EcritureComptable || mongoose.model('EcritureComptable', ecritureComptableSchema);

module.exports = EcritureComptable;