// ==============================================================================
//                Service d'Authentification (Logique Métier)
//
// Ce service orchestre la logique métier complexe pour l'authentification :
//   - Inscription d'utilisateurs avec assignation de rôle par défaut.
//   - Connexion avec vérification des identifiants et génération de tokens.
//   - Rafraîchissement de session.
//   - Processus complet de réinitialisation de mot de passe.
// ==============================================================================

const bcrypt = require('bcryptjs');
const User = require('../../models/auth/User');
const Role = require('../../models/auth/Role');
const tokenService = require('./tokenService');
const { sendEmail } = require('../../config/email');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../config/jwt');
const { USER_ROLES } = require('../../utils/constants');
const { isStrongPassword } = require('../../utils/validators');
const { capitalizeFirstLetter } = require('../../utils/helpers');

/**
 * Enregistre un nouvel utilisateur dans la base de données.
 * @param {object} userData - Données de l'utilisateur (firstName, lastName, email, password).
 * @returns {Promise<import('mongoose').Document>} L'objet utilisateur créé (sans le mdp).
 * @throws {Error} Si l'email est déjà utilisé ou si le rôle par défaut n'est pas trouvé.
 */
async function registerUser(userData) {
  const { email, password, firstName, lastName } = userData;

  if (!isStrongPassword(password)) {
    throw new Error('Le mot de passe ne respecte pas les critères de sécurité (8+ caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 spécial).');
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('Un utilisateur avec cet email existe déjà.');
  }

  const defaultRole = await Role.findOne({ name: USER_ROLES.VENDEUR });
  if (!defaultRole) {
    throw new Error('Configuration du système incomplète : rôle par défaut introuvable.');
  }

  const newUser = new User({
    firstName: capitalizeFirstLetter(firstName),
    lastName: lastName.toUpperCase(),
    email: email.toLowerCase(),
    password,
    role: defaultRole._id,
  });

  await newUser.save();

  newUser.password = undefined;
  return newUser;
}

/**
 * Authentifie un utilisateur et génère des tokens.
 * @param {string} email - L'email de l'utilisateur.
 * @param {string} password - Le mot de passe en clair de l'utilisateur.
 * @returns {Promise<{accessToken: string, refreshToken: string, user: object}>}
 * @throws {Error} Si les identifiants sont incorrects ou si l'utilisateur est inactif.
 */
async function loginUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate({
      path: 'role',
      select: 'name permissions', // Sélectionne le nom du rôle et le tableau d'IDs de permissions
      populate: {
        path: 'permissions',
        select: 'name -_id', // Pour chaque ID de permission, récupère uniquement le nom
      },
    });

  if (!user || !(await user.comparePassword(password))) {
    throw new Error('Email ou mot de passe incorrect.');
  }

  if (!user.isActive) {
    throw new Error('Ce compte utilisateur a été désactivé.');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  // Formater les permissions en un simple tableau de chaînes
  const userPermissions = user.role.permissions.map(p => p.name);
  
  // Créer l'objet utilisateur final à renvoyer
  const userToReturn = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name,
    permissions: userPermissions,
  };

  return { accessToken, refreshToken, user: userToReturn };
}

/**
 * Génère un nouvel access token en utilisant un refresh token valide.
 * @param {string} token - Le refresh token.
 * @returns {Promise<{accessToken: string}>}
 * @throws {Error} Si le refresh token est invalide.
 */
async function refreshAuthToken(token) {
  const decoded = verifyRefreshToken(token);
  if (!decoded || !decoded.id) {
    throw new Error('Refresh token invalide ou expiré.');
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new Error('Utilisateur introuvable ou compte désactivé.');
  }

  const accessToken = generateAccessToken(user._id);
  return { accessToken };
}

/**
 * Gère la demande de réinitialisation de mot de passe.
 * @param {string} email - L'email de l'utilisateur.
 */
async function requestPasswordReset(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  // Ne pas révéler si l'utilisateur existe ou non.
  if (!user) {
    return;
  }

  const resetToken = await tokenService.createToken(user._id, 'passwordReset', 1); // Valide 1 jour
  const resetURL = `${process.env.APP_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe - ERP Sénégal',
    // On utilisera un template HTML/Pug plus tard
    html: `<p>Bonjour ${user.firstName},</p><p>Pour réinitialiser votre mot de passe, veuillez cliquer sur ce <a href="${resetURL}">lien</a>. Le lien expirera dans 24 heures.</p>`,
    text: `Bonjour ${user.firstName},\n\nPour réinitialiser votre mot de passe, copiez ce lien dans votre navigateur : ${resetURL}\nLe lien expirera dans 24 heures.`,
  });
}

/**
 * Finalise la réinitialisation du mot de passe avec un token valide.
 * @param {string} token - Le token de réinitialisation.
 * @param {string} newPassword - Le nouveau mot de passe.
 * @throws {Error} Si le token est invalide ou le mot de passe trop faible.
 */
async function finalizePasswordReset(token, newPassword) {
  if (!isStrongPassword(newPassword)) {
    throw new Error('Le nouveau mot de passe ne respecte pas les critères de sécurité.');
  }

  const tokenDoc = await tokenService.validateToken(token, 'passwordReset');
  if (!tokenDoc) {
    throw new Error('Le token de réinitialisation est invalide ou a expiré.');
  }

  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throw new Error('Utilisateur associé au token introuvable.');
  }

  user.password = newPassword;
  await user.save();
  await tokenService.deleteToken(token, 'passwordReset');
}


module.exports = {
  registerUser,
  loginUser,
  refreshAuthToken,
  requestPasswordReset,
  finalizePasswordReset,
};