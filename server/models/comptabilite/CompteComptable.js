// ==============================================================================
//           Modèle Mongoose pour les Comptes Comptables (Plan Comptable)
//
// Ce modèle définit la structure d'un compte individuel au sein du plan comptable
// de l'entreprise. Il est conçu pour être compatible avec les standards du
// SYSCOHADA / OHADA.
// ==============================================================================

const mongoose = require('mongoose');

const compteComptableSchema = new mongoose.Schema(
  {
    /**
     * Le numéro du compte (ex: '411', '701', '601').
     * C'est l'identifiant principal et il doit être unique.
     */
    numero: {
      type: String,
      required: [true, 'Le numéro de compte est obligatoire.'],
      unique: true,
      trim: true,
    },

    /**
     * L'intitulé ou le libellé du compte (ex: "Clients", "Ventes de marchandises").
     */
    libelle: {
      type: String,
      required: [true, 'Le libellé du compte est obligatoire.'],
      trim: true,
    },
    
    /**
     * La classe du compte selon le plan SYSCOHADA (de 1 à 9).
     * Ex: 1-Comptes de ressources durables, 4-Comptes de tiers, 7-Comptes de produits.
     * Ce champ est calculé automatiquement à partir du premier chiffre du numéro.
     */
    classe: {
        type: Number,
        min: 1,
        max: 9,
    },

    /**
     * Le sens par défaut du compte (Débit ou Crédit).
     * Ex: Un compte de charge (Classe 6) augmente au Débit.
     *     Un compte de produit (Classe 7) augmente au Crédit.
     */
    sens: {
        type: String,
        enum: ['Debit', 'Credit'],
    },
    
    /**
     * Type de compte pour des logiques de gestion spécifiques.
     * - Tiers: Représente un partenaire (Client, Fournisseur).
     * - Tresorerie: Compte bancaire, caisse.
     * - Bilan: Apparaît au bilan.
     * - Resultat: Apparaît au compte de résultat.
     */
    type: {
        type: String,
        enum: ['Tiers', 'Tresorerie', 'Bilan', 'Resultat', 'Autre'],
        required: true,
    },

    /**
     * Indique si le compte est "lettrable".
     * Seuls les comptes lettrables (généralement les comptes de tiers) peuvent
     * faire l'objet d'un lettrage pour rapprocher débits et crédits.
     */
    estLettrable: {
        type: Boolean,
        default: false,
    },
    
    isActive: {
        type: Boolean,
        default: true,
    }
  },
  {
    timestamps: true,
    collection: 'comptabilite_plan',
  }
);


// --- HOOK PRE-SAVE ---
// Pour calculer automatiquement la classe du compte à partir de son numéro.
compteComptableSchema.pre('save', function(next) {
    if (this.isModified('numero') || this.isNew) {
        if (this.numero && this.numero.length > 0) {
            this.classe = parseInt(this.numero.charAt(0), 10);
        }
    }
    next();
});


// Index pour accélérer les recherches par numéro et libellé
compteComptableSchema.index({ numero: 1 });
compteComptableSchema.index({ libelle: 'text' });


const CompteComptable = mongoose.model('CompteComptable', compteComptableSchema);

module.exports = CompteComptable;