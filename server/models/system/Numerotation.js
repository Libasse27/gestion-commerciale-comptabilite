// ==============================================================================
//           Modèle Mongoose pour la Gestion de la Numérotation
//
// Ce modèle est une version avancée du "Compteur". Il permet de configurer
// des schémas de numérotation complexes et personnalisables pour chaque
// type de document (factures, clients, etc.).
//
// Il stocke le format, le préfixe, et la dernière séquence utilisée pour
// chaque type de document.
// ==============================================================================

const mongoose = require('mongoose');

const numerotationSchema = new mongoose.Schema(
  {
    /**
     * L'identifiant unique du type de document à numéroter.
     * Ex: 'facture', 'devis', 'client'.
     * C'est la clé utilisée par le service pour trouver la bonne configuration.
     */
    typeDocument: {
      type: String,
      required: true,
      unique: true,
    },

    /**
     * Le format de la numérotation.
     * Placeholders supportés :
     *   - {PREFIX}: Le préfixe (ex: 'FAC').
     *   - {AAAA}: L'année sur 4 chiffres.
     *   - {AA}: L'année sur 2 chiffres.
     *   - {MM}: Le mois sur 2 chiffres.
     *   - {SEQ}: Le numéro de séquence.
     */
    format: {
      type: String,
      required: true,
      default: '{PREFIX}-{AAAA}-{SEQ}',
    },

    /**
     * Le préfixe à utiliser dans le format.
     */
    prefixe: {
      type: String,
      required: true,
      uppercase: true,
    },

    /**
     * La longueur du numéro de séquence (pour le padding avec des zéros).
     * Ex: 4 pour avoir '0001'.
     */
    longueurSequence: {
      type: Number,
      required: true,
      default: 4,
    },

    /**
     * La dernière valeur de la séquence utilisée.
     */
    derniereSequence: {
      type: Number,
      default: 0,
    },
    
    /**
     * (Optionnel) Pour les séquences qui se réinitialisent (ex: chaque année).
     * Ex: 'Annuelle', 'Mensuelle'. Si null, la séquence est continue.
     */
    resetSequence: {
        type: String,
        enum: ['Annuelle', 'Mensuelle', null],
        default: null,
    },
    
    derniereAnneeReset: { type: Number },
    dernierMoisReset: { type: Number },
  },
  {
    timestamps: true,
    collection: 'system_numerotations',
  }
);


const Numerotation = mongoose.model('Numerotation', numerotationSchema);

module.exports = Numerotation;