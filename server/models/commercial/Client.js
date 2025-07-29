// ==============================================================================
//                Modèle Mongoose pour les Clients
//
// MISE À JOUR : Utilise maintenant le `numerotationService` pour générer
// automatiquement le `codeClient` en se basant sur une configuration
// centralisée et flexible.
// ==============================================================================

const mongoose = require('mongoose');
// Import du service de numérotation, qui remplace l'ancien modèle Compteur
const numerotationService = require('../../services/system/numerotationService');

const clientSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du client est obligatoire.'],
      trim: true,
    },
    codeClient: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir une adresse email valide.'],
    },
    telephone: { type: String, trim: true },
    adresse: { type: String, trim: true },
    ninea: { type: String, trim: true },
    estExonereTVA: { type: Boolean, default: false },
    termesPaiement: { type: Number, default: 30 },
    solde: { type: Number, default: 0 },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true,
    collection: 'commercial_clients',
  }
);

// --- HOOK PRE-SAVE pour la numérotation automatique ---
clientSchema.pre('save', async function(next) {
  // Le hook ne s'exécute que pour les nouveaux documents
  if (this.isNew && !this.codeClient) {
    try {
      // Appel au nouveau service en spécifiant le type de document 'client'
      this.codeClient = await numerotationService.getNextNumero('client');
    } catch (error) {
      // Passe l'erreur au middleware suivant en cas de problème de numérotation
      return next(error);
    }
  }
  next();
});

// Index pour accélérer les recherches
clientSchema.index({ nom: 'text', codeClient: 'text' });

const Client = mongoose.model('Client', clientSchema);

module.exports = Client;