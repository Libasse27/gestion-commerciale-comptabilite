// ==============================================================================
//           Modèle Mongoose pour les Échéanciers de Paiement
//
// Ce modèle permet de définir un plan de paiement en plusieurs fois pour
// une facture spécifique. Il est essentiel pour le suivi des paiements
// partiels et la prévision de la trésorerie.
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Sous-schéma pour une ligne d'échéance.
 * Chaque ligne représente un paiement partiel prévu.
 */
const ligneEcheanceSchema = new mongoose.Schema({
  dateEcheance: {
    type: Date,
    required: true,
  },
  montantDu: {
    type: Number,
    required: true,
  },
  statut: {
    type: String,
    enum: ['À payer', 'Payée', 'En retard'],
    default: 'À payer',
  },
  paiementAssocie: { // L'ID du paiement qui a soldé cette échéance
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Paiement',
    default: null,
  }
}, { _id: false });


/**
 * Schéma principal pour l'Échéancier.
 */
const echeancierSchema = new mongoose.Schema(
  {
    /**
     * La facture concernée par cet échéancier.
     * Une facture ne peut avoir qu'un seul échéancier actif.
     */
    facture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Facture',
      required: true,
      unique: true, // Garantit qu'une facture n'a qu'un seul échéancier
    },

    /**
     * Le client associé, pour faciliter les requêtes.
     */
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true,
    },

    /**
     * Le tableau des différentes échéances.
     */
    lignes: {
        type: [ligneEcheanceSchema],
        validate: [
            {
                validator: function(lignes) { return lignes.length > 0; },
                message: 'Un échéancier doit contenir au moins une ligne.'
            },
            {
                validator: async function(lignes) {
                    const facture = await mongoose.model('Facture').findById(this.facture);
                    if (!facture) return false;
                    const totalEcheances = lignes.reduce((sum, l) => sum + l.montantDu, 0);
                    // Accepter une petite marge d'erreur
                    return Math.abs(totalEcheances - facture.totalTTC) < 0.01;
                },
                message: 'La somme des montants des échéances doit être égale au total TTC de la facture.'
            }
        ]
    },
    
    statut: {
      type: String,
      enum: ['En cours', 'Soldé', 'Annulé'],
      default: 'En cours',
    },
    
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'paiements_echeanciers',
  }
);


const Echeancier = mongoose.model('Echeancier', echeancierSchema);

module.exports = Echeancier;