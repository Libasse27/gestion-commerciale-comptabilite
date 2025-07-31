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
     */
    email: {
      type: String,
      required: [true, "L'adresse email est obligatoire."],
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
     */
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire.'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères.'],
      select: false,
    },

    /**
     * La référence vers le rôle de l'utilisateur.
     */
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, "Le rôle de l'utilisateur est obligatoire."],
    },

    /**
     * Statut du compte utilisateur.
     */
    isActive: {
      type: Boolean,
      default: true,
    },

    /**
     * Date du dernier changement de mot de passe.
     */
    passwordChangedAt: Date,
  },
  {
    timestamps: true,
    collection: 'auth_users',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// --- VIRTUALS ---
userSchema.virtual('fullName').get(function () {
  if (!this.firstName || !this.lastName) {
    return '';
  }
  return `${this.firstName} ${this.lastName}`;
});


// --- MIDDLEWARE (HOOKS) MONGOOSE ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});


// --- MÉTHODES D'INSTANCE ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.passwordChangedAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10);
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};


/**
 * ✅ MISE À JOUR APPLIQUÉE
 * On vérifie si le modèle 'User' a déjà été compilé avant de le créer.
 * Cette protection est la clé pour un développement stable avec des outils
 * comme Nodemon ou Vite qui rechargent les modules à la volée.
 */
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;