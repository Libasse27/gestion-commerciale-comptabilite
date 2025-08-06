// server/models/auth/Token.js
// ==============================================================================
//           Modèle Mongoose pour les Tokens à Usage Unique
//
// Ce modèle stocke les tokens temporaires (réinitialisation de mot de passe,
// vérification d'email). Il est conçu pour être sécurisé et auto-nettoyant.
//
// Il utilise un index TTL sur le champ `expiresAt` pour que MongoDB
// supprime automatiquement les tokens expirés.
// ==============================================================================

const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    /**
     * Référence à l'utilisateur concerné par le token.
     */
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    
    /**
     * Le token haché (ex: avec SHA256). Ne jamais stocker le token en clair.
     */
    token: {
        type: String,
        required: true,
    },

    /**
     * Le type de token, pour différencier les usages.
     */
    type: {
        type: String,
        required: true,
        enum: ['passwordReset', 'emailVerification', 'invite'],
    },

    /**
     * La date et l'heure d'expiration du token.
     */
    expiresAt: {
        type: Date,
        required: true,
    },
}, {
    timestamps: { createdAt: true, updatedAt: false }, // On ne suit que la date de création
    collection: 'auth_tokens',
});

// --- INDEXS ---
// Index pour accélérer la recherche de token pour un utilisateur et un type donné.
tokenSchema.index({ userId: 1, type: 1 });

// Index TTL : MongoDB vérifiera périodiquement ce champ et supprimera les documents
// où la date d'expiration est passée.
// `expireAfterSeconds: 0` signifie que le document est supprimé dès que `expiresAt` est dans le passé.
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });


const Token = mongoose.models.Token || mongoose.model('Token', tokenSchema);

module.exports = Token;