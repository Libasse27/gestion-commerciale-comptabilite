// ==============================================================================
//           Modèle Mongoose pour les Rapprochements Bancaires
//
// Ce modèle enregistre le processus de rapprochement entre le compte Banque
// en comptabilité (ex: 521) et le relevé bancaire pour une période donnée.
//
// Il permet de lister les opérations pointées, de calculer les soldes et
// d'identifier les écarts.
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Sous-schéma pour les lignes du rapprochement.
 * Chaque ligne représente une écriture du grand livre du compte banque
 * qui est incluse dans le rapprochement.
 */
const ligneRapprochementSchema = new mongoose.Schema({
  ecritureComptable: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'EcritureComptable',
    required: true,
  },
  libelle: { type: String, required: true },
  date: { type: Date, required: true },
  debit: { type: Number, default: 0 },
  credit: { type: Number, default: 0 },
  
  /**
   * Indique si cette ligne a été "pointée", c'est-à-dire si elle
   * correspond à une ligne sur le relevé bancaire.
   */
  estPointee: {
    type: Boolean,
    default: false,
  },
  datePointage: {
      type: Date,
  }
}, { _id: false });


/**
 * Schéma principal pour le Rapprochement Bancaire.
 */
const rapprochementBancaireSchema = new mongoose.Schema(
  {
    /**
     * Le compte de trésorerie (banque) concerné par le rapprochement.
     */
    compteTresorerie: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CompteComptable',
        required: true,
    },
    
    /**
     * La période couverte par le rapprochement.
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
     * Les soldes de départ et de fin.
     */
    soldeInitialComptable: { type: Number, required: true },
    soldeFinalReleveBancaire: { type: Number, required: true },

    /**
     * Lignes représentant les mouvements du compte en comptabilité
     * pour la période.
     */
    lignes: [ligneRapprochementSchema],

    /**
     * Soldes calculés après pointage.
     */
    soldeFinalComptableCalcule: { type: Number }, // Sum(soldeInitial + debits - credits)
    soldeFinalRapproche: { type: Number }, // Solde théorique qui devrait correspondre au relevé

    statut: {
      type: String,
      enum: ['En cours', 'Rapproché', 'Annulé'],
      default: 'En cours',
    },
    
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rapprochePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateRapprochement: {
        type: Date,
    }
  },
  {
    timestamps: true,
    collection: 'comptabilite_rapprochements',
  }
);


const RapprochementBancaire = mongoose.model('RapprochementBancaire', rapprochementBancaireSchema);

module.exports = RapprochementBancaire;