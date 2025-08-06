// server/models/comptabilite/RapprochementBancaire.js
const mongoose = require('mongoose');

const ligneRapprochementSchema = new mongoose.Schema({
  // Référence à l'écriture comptable parente
  ecritureId: { type: mongoose.Schema.Types.ObjectId, ref: 'EcritureComptable', required: true },
  
  // Mongoose ne peut pas référencer directement un sous-document.
  // On stocke donc l'ID de la ligne spécifique de l'écriture.
  // Ce n'est pas une clé étrangère, juste un identifiant pour la logique applicative.
  ligneEcritureId: { type: mongoose.Schema.Types.ObjectId, required: true },

  libelle: { type: String, required: true },
  date: { type: Date, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  estPointee: { type: Boolean, default: false },
  datePointage: { type: Date }
}, { _id: false });


const rapprochementBancaireSchema = new mongoose.Schema(
  {
    compteTresorerie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompteComptable',
        required: true,
    },
    dateDebut: { type: Date, required: true },
    dateFin: { type: Date, required: true },
    soldeInitialComptable: { type: Number, required: true },
    soldeFinalReleveBancaire: { type: Number, required: true },
    lignes: [ligneRapprochementSchema],
    soldeFinalComptableCalcule: { type: Number, default: 0 },
    soldeRapproche: { type: Number, default: 0 },
    statut: { type: String, enum: ['En cours', 'Rapproché', 'Annulé'], default: 'En cours' },
    creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rapprochePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    dateRapprochement: { type: Date }
  },
  {
    timestamps: true,
    collection: 'comptabilite_rapprochements',
  }
);

rapprochementBancaireSchema.index({ compteTresorerie: 1, dateFin: -1 });

const RapprochementBancaire = mongoose.models.RapprochementBancaire || mongoose.model('RapprochementBancaire', rapprochementBancaireSchema);

module.exports = RapprochementBancaire;