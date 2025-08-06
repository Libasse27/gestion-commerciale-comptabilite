const mongoose = require('mongoose');
const numerotationService = require('../../services/system/numerotationService');
const { roundTo } = require('../../utils/numberUtils');

const imputationSchema = new mongoose.Schema({
    facture: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'imputations.factureModel' },
    factureModel: { type: String, required: true, enum: ['Facture', 'FactureAchat'] },
    montantImpute: { type: Number, required: true, min: 0.01 },
}, { _id: false });

const paiementSchema = new mongoose.Schema(
  {
    reference: { type: String, unique: true, trim: true, uppercase: true },
    datePaiement: { type: Date, required: true, default: Date.now },
    montant: { type: Number, required: true, validate: { validator: (v) => v > 0, message: "Le montant d'un paiement doit être positif." } },
    sens: { type: String, required: true, enum: ['Entrant', 'Sortant'] },
    tiers: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'tiersModel' },
    tiersModel: { type: String, required: true, enum: ['Client', 'Fournisseur'] },
    modePaiement: { type: mongoose.Schema.Types.ObjectId, ref: 'ModePaiement', required: true },
    compteTresorerie: { type: mongoose.Schema.Types.ObjectId, ref: 'CompteComptable', required: true },
    imputations: {
        type: [imputationSchema],
        validate: {
            validator: function(imputations) {
                const totalImpute = imputations.reduce((sum, i) => sum + i.montantImpute, 0);
                return Math.abs(roundTo(totalImpute) - roundTo(this.montant)) < 0.01;
            },
            message: "La somme des montants imputés doit être égale au montant total du paiement."
        }
    },
    statut: { type: String, enum: ['Non rapproché', 'Rapproché'], default: 'Non rapproché' },
    enregistrePar: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    notes: { type: String, trim: true },
  },
  {
    timestamps: true,
    collection: 'paiements_transactions',
  }
);

paiementSchema.pre('save', async function(next) {
    if (this.isNew && !this.reference) {
        try {
            const typeDoc = this.sens === 'Entrant' ? 'paiement_entrant' : 'paiement_sortant';
            this.reference = await numerotationService.getNextNumero(typeDoc);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const Paiement = mongoose.models.Paiement || mongoose.model('Paiement', paiementSchema);

module.exports = Paiement;