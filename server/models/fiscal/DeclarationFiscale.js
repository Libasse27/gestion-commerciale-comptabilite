// ==============================================================================
//           Modèle Mongoose pour les Déclarations de TVA
//
// Ce modèle enregistre le résultat du calcul de la déclaration de TVA pour
// une période donnée (généralement un mois).
//
// Il sert d'historique des déclarations et est crucial pour le calcul du
// report du crédit de TVA d'une période à l'autre.
// ==============================================================================

const mongoose = require('mongoose');

const declarationTVASchema = new mongoose.Schema(
  {
    /**
     * La période de la déclaration, formatée en 'AAAA-MM'.
     * Doit être unique.
     */
    periode: {
      type: String,
      required: true,
      unique: true,
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Le format de la période doit être AAAA-MM'],
    },

    /**
     * La date à laquelle la déclaration a été générée ou soumise.
     */
    dateDeclaration: { 
      type: Date,
      default: Date.now 
    },
    
    // --- Composantes de la déclaration ---

    /**
     * Total de la TVA collectée sur les ventes de la période.
     */
    tvaCollectee: { 
      type: Number,
      required: true,
      default: 0
    },
    
    /**
     * Total de la TVA déductible sur les achats de la période.
     */
    tvaDeductible: { 
      type: Number,
      required: true,
      default: 0 
    },
    
    /**
     * Le crédit de TVA reporté de la période précédente.
     */
    creditTvaAnterieur: { 
      type: Number,
      default: 0 
    },
    
    // --- Résultat de la déclaration ---

    /**
     * Le montant final de la TVA à payer à l'État pour cette période.
     * Calcul : tvaCollectee - (tvaDeductible + creditTvaAnterieur), si positif.
     */
    tvaAPayer: { 
      type: Number,
      default: 0
    },
    
    /**
     * Le crédit de TVA à reporter sur la période suivante.
     * Calcul : (tvaDeductible + creditTvaAnterieur) - tvaCollectee, si positif.
     */
    creditTvaAReporter: { 
      type: Number,
      default: 0 
    },
  
    statut: {
      type: String,
      enum: ['Brouillon', 'Déclarée'],
      default: 'Brouillon',
    },
    
    declarePar: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
  },
  {
    timestamps: true,
    collection: 'fiscal_declarations_tva',
  }
);


const DeclarationTVA = mongoose.model('DeclarationTVA', declarationTVASchema);

module.exports = DeclarationTVA;