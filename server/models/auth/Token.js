// ==============================================================================
//           Modèle Mongoose pour les Tokens Temporaires
//
// Ce modèle est utilisé pour stocker des tokens à usage unique et à durée
// de vie limitée, tels que les tokens de réinitialisation de mot de passe
// ou de vérification d'email.
//
// Il utilise un index TTL (Time-To-Live) de MongoDB pour que les documents
// expirés soient automatiquement supprimés de la base de données, ce qui
// assure un nettoyage automatique et efficace.
// ==============================================================================

const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // Fait référence au modèle User
  },
  
  token: {
    type: String,
    required: true,
  },
  
  type: {
    type: String,
    required: true,
    enum: ['passwordReset', 'emailVerification', 'invite'], // Types de tokens autorisés
  },

  // Ce champ est utilisé par l'index TTL pour la suppression automatique
  expiresAt: {
    type: Date,
    required: true,
  },
}, { 
  timestamps: true, // Ajoute createdAt et updatedAt
  collection: 'auth_tokens'
});

// --- INDEX ---

// Index TTL (Time-To-Live) : MongoDB vérifiera périodiquement ce champ
// et supprimera automatiquement tout document où `expiresAt` est dans le passé.
// `expireAfterSeconds: 0` signifie "supprimer dès que la date est passée".
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


const Token = mongoose.model('Token', tokenSchema);

module.exports = Token;