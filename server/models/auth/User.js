// server/models/auth/User.js
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
const { isStrongPassword } = require('../../utils/validators');

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, 'Le prénom est obligatoire.'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Le nom de famille est obligatoire.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "L'adresse email est obligatoire."],
      unique: true,
      lowercase: true,
      trim: true,
      match: [ /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez fournir une adresse email valide.' ],
    },
    password: {
      type: String,
      required: [true, 'Le mot de passe est obligatoire.'],
      minlength: [8, 'Le mot de passe doit contenir au moins 8 caractères.'],
      validate: [isStrongPassword, 'Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.'],
      select: false, // Ne jamais renvoyer le mot de passe dans les requêtes
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Role',
      required: [true, "Le rôle de l'utilisateur est obligatoire."],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
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
  if (!this.firstName || !this.lastName) return '';
  return `${this.firstName} ${this.lastName}`;
});

// --- MIDDLEWARE (HOOKS) MONGOOSE ---
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000; // -1s pour éviter les problèmes de timing avec la création du JWT
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

const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;