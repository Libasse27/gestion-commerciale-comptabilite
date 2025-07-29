// ==============================================================================
//                Modèle Mongoose pour les Factures de Vente
//
// MISE À JOUR : Utilise maintenant le `numerotationService` pour générer
// automatiquement le `numero` de la facture.
// ==============================================================================

const mongoose = require('mongoose');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const ligneDocumentSchema = require('../schemas/ligneDocumentSchema');
const numerotationService = require('../../services/system/numerotationService'); // Import du service

const factureSchema = new mongoose.Schema(
  {
    numero: {
      type: String,
      unique: true,
      // Le `required: true` n'est plus nécessaire ici, car le numéro est généré par le hook.
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true,
    },
    dateEmission: {
      type: Date,
      default: Date.now,
    },
    dateEcheance: {
      type: Date,
      required: true,
    },
    lignes: {
      type: [ligneDocumentSchema],
      validate: [v => Array.isArray(v) && v.length > 0, 'Une facture doit contenir au moins une ligne.'],
    },
    
    // --- Totaux ---
    totalHT: { type: Number, required: true, default: 0 },
    totalTVA: { type: Number, required: true, default: 0 },
    totalTTC: { type: Number, required: true, default: 0 },

    // --- Suivi du Paiement ---
    montantPaye: {
        type: Number,
        default: 0,
    },
    soldeDu: {
        type: Number, // totalTTC - montantPaye
        required: true,
    },
    
    // --- Statut et Suivi Comptable ---
    statut: {
      type: String,
      enum: [
        DOCUMENT_STATUS.BROUILLON,
        DOCUMENT_STATUS.ENVOYE,
        DOCUMENT_STATUS.PAYEE,
        DOCUMENT_STATUS.PARTIELLEMENT_PAYEE,
        DOCUMENT_STATUS.EN_RETARD,
        DOCUMENT_STATUS.ANNULE,
      ],
      default: DOCUMENT_STATUS.BROUILLON,
    },
    comptabilise: {
        type: Boolean,
        default: false,
    },
    
    // --- Références ---
    commandeOrigine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Commande',
      default: null,
    },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    collection: 'commercial_factures',
  }
);

// --- HOOK PRE-SAVE pour la numérotation automatique ---
factureSchema.pre('save', async function(next) {
    // Si c'est un nouveau document et que le numéro n'est pas déjà défini
    if (this.isNew && !this.numero) {
        try {
            // Appel au service de numérotation pour le type 'facture'
            this.numero = await numerotationService.getNextNumero('facture');
        } catch (error) {
            // Passe l'erreur à Mongoose pour la gérer
            return next(error);
        }
    }
    
    // Calcul du solde dû automatiquement (logique existante)
    this.soldeDu = this.totalTTC - this.montantPaye;

    // Mise à jour automatique du statut en fonction du paiement (logique existante)
    if (this.soldeDu <= 0.01) { // Utilisation d'une petite marge pour les flottants
        this.statut = DOCUMENT_STATUS.PAYEE;
    } else if (this.montantPaye > 0 && this.soldeDu > 0.01) { // Marge pour être sûr
        this.statut = DOCUMENT_STATUS.PARTIELLEMENT_PAYEE;
    }
    // La logique pour 'EN_RETARD' sera gérée par une tâche planifiée (cron job)
    
    next();
});

const Facture = mongoose.model('Facture', factureSchema);

module.exports = Facture;