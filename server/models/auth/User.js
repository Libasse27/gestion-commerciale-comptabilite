// ==============================================================================
//                  Modèle Mongoose pour les Utilisateurs
//
// Ce modèle représente un utilisateur de l'application. Il contient les
// informations d'identification, le statut, et une référence vers son rôle,
// qui détermine ses permissions.
//
// Il inclut également une logique de "hook" pre-save pour hacher automatiquement
// le mot de passe avant chaque sauvegarde, garantissant que les mots de passe
// en clair ne sont jamais stockés dans la base de données.
// ==============================================================================

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

/**
 * Schéma pour un Utilisateur.
 */
const userSchema = new mongoose.Schema(
  {
    /**
     * Le prénom de l'utilisateur.
     */
    firstName: {
      type: String,
      required: [true, 'Le prénom est obligatoire.'],
      trim: true,
    },

    /**
     * Le nom de famille de l'utilisateur.
     */
    lastName: {
      type: String,
      required: [true, 'Le nom de famille est obligatoire.'],
      trim: true,
    },

    /**
     * L'adresse email de l'utilisateur, utilisée pour la connexion.
     * Elle doit être unique et est automatiquement convertie en minuscules.
     */
    email: {
      type: String,
      required: [true, 'L\'adresse email est obligatoire.'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Veuillez fournir une adresse email valide.',
      ],
    },

    /**
     * Le mot de passe haché de l'utilisateur.
     * Le champ n'est pas retourné par défaut dans les requêtes (`select: false`).
     */
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire.'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères.'],
      select: false, // Ne pas inclure ce champ lors des requêtes find() par défaut
    },

    /**
     * La référence vers le rôle de l'utilisateur, qui définit ses permissions.
     */
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role', // Fait le lien avec le modèle Role
      required: [true, 'Le rôle de l\'utilisateur est obligatoire.'],
    },

    /**
     * Statut du compte utilisateur. Un compte inactif ne peut pas se connecter.
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Champ pour stocker la date du dernier changement de mot de passe.
     * Utile pour invalider les anciens tokens JWT si le mot de passe a changé.
     */
    passwordChangedAt: Date,

    /**
     * Champ pour stocker le token de réinitialisation de mot de passe (haché).
     * Non utilisé si vous avez un service de token dédié, mais peut être une alternative.
     */
    // passwordResetToken: String,
    // passwordResetExpires: Date,
  },
  {
    /**
     * Options du schéma :
     * - timestamps: ajoute automatiquement `createdAt` et `updatedAt`.
     * - toJSON/toObject: permet de définir des transformateurs virtuels.
     */
    timestamps: true,
    collection: 'auth_users',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- VIRTUALS ---

/**
 * Champ virtuel pour obtenir le nom complet de l'utilisateur.
 */
userSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// --- MIDDLEWARE (HOOKS) MONGOOSE ---

/**
 * Hook "pre-save" pour hacher le mot de passe avant de sauvegarder le document.
 * Ce hook s'exécute uniquement si le champ 'password' a été modifié.
 */
userSchema.pre('save', async function (next) {
  // Ne s'exécute que si le mot de passe a été modifié (ou est nouveau)
  if (!this.isModified('password')) return next();

  // Hacher le mot de passe avec un coût de 12
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);

  // Si ce n'est pas un nouveau document, mettre à jour passwordChangedAt
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // -1s pour éviter les problèmes de timing
  }

  next();
});

// --- MÉTHODES D'INSTANCE ---

/**
 * Méthode pour comparer le mot de passe candidat avec le mot de passe haché de l'utilisateur.
 * @param {string} candidatePassword - Le mot de passe fourni par l'utilisateur lors de la connexion.
 * @returns {Promise<boolean>} `true` si les mots de passe correspondent.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

/**
 * Méthode pour vérifier si le mot de passe a été changé après l'émission d'un token JWT.
 * @param {number} JWTTimestamp - Le timestamp (iat) du token JWT.
 * @returns {boolean} `true` si le mot de passe a été changé après l'émission du token.
 */
userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  // Le mot de passe n'a jamais été changé
  return false;
};

/**
 * Création du modèle 'User' à partir du schéma.
 */
const User = mongoose.model('User', userSchema);

module.exports = User;