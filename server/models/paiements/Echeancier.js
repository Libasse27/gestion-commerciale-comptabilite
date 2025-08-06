// server/models/paiements/Echeancier.js
const mongoose = require('mongoose');
const { roundTo } = require('../../utils/numberUtils');

const ligneEcheanceSchema = new mongoose.Schema({
  dateEcheance: { type: Date, required: true },
  montantDu: { type: Number, required: true, min: [0.01, 'Le montant de l\'échéance doit être positif.'] },
  statut: { type: String, enum: ['À payer', 'Payée', 'En retard'], default: 'À payer' },
  paiementAssocie: { type: mongoose.Schema.Types.ObjectId, ref: 'Paiement', default: null }
}, { _id: false });

const echeancierSchema = new mongoose.Schema(
  {
    facture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facture',
      required: true,
      unique: true // L'option unique crée l'index nécessaire
    },
    client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
    lignes: {
        type: [ligneEcheanceSchema],
        validate: [
            { validator: (l) => l.length > 0, msg: 'Un échéancier doit contenir au moins une ligne.' },
            {
                validator: async function(lignes) {
                    const Facture = mongoose.model('Facture');
                    const facture = await Facture.findById(this.facture).lean();
                    if (!facture) return false;
                    
                    const totalEcheances = lignes.reduce((sum, l) => sum + l.montantDu, 0);
                    
                    return Math.abs(roundTo(totalEcheances) - roundTo(facture.totalTTC)) < 0.01;
                },
                message: 'La somme des montants des échéances doit être égale au total TTC de la facture.'
            }
        ]
    },
    statut: { type: String, enum: ['En cours', 'Soldé', 'Annulé'], default: 'En cours' },
    creePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  {
    timestamps: true,
    collection: 'paiements_echeanciers',
  }
);

// Pas besoin de echeancierSchema.index({ facture: 1 }); car unique:true le fait déjà.
// On garde celui-ci qui est un index composite.
echeancierSchema.index({ client: 1, statut: 1 });


const Echeancier = mongoose.models.Echeancier || mongoose.model('Echeancier', echeancierSchema);

module.exports = Echeancier;