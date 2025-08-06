// server/models/commercial/Client.js
// ==============================================================================
//                Modèle Mongoose pour les Clients
// ==============================================================================

const mongoose = require('mongoose');
const numerotationService = require('../../services/system/numerotationService');
const { isValidNINEA } = require('../../utils/validators');

const clientSchema = new mongoose.Schema(
  {
    nom: {
      type: String,
      required: [true, 'Le nom du client est obligatoire.'],
      trim: true,
      index: true, // Méthode propre pour un index simple
    },
    codeClient: {
      type: String,
      unique: true, // Cette option crée déjà un index unique.
      uppercase: true,
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
    ninea: {
      type: String,
      trim: true,
      validate: {
        validator: function(v) { return !v || isValidNINEA(v); }, // !v gère null, undefined et ''
        message: 'Le format du NINEA est invalide.'
      }
    },
    estExonereTVA: { type: Boolean, default: false },
    termesPaiement: { type: Number, default: 30, min: 0 },
    solde: { type: Number, default: 0 },
    creePar: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    modifiePar: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
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
  if (this.isNew && !this.codeClient) {
    try {
      this.codeClient = await numerotationService.getNextNumero('client');
    } catch (error) {
      return next(error);
    }
  }
  next();
});

// Il n'y a plus besoin de déclarer les index simples ici.

const Client = mongoose.models.Client || mongoose.model('Client', clientSchema);

module.exports = Client;