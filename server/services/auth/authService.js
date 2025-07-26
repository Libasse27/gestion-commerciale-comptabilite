// ==============================================================================
//                Service d'Authentification (Logique Métier)
//
// Ce service encapsule toute la logique métier liée à l'authentification des
// utilisateurs. Il est responsable de :
//   - L'inscription de nouveaux utilisateurs.
//   - La connexion des utilisateurs (génération de tokens).
//   - Le rafraîchissement des tokens d'accès.
//   - La gestion du processus de réinitialisation de mot de passe.
//
// Il orchestre les appels aux modèles, aux services spécialisés (comme tokenService)
// et aux utilitaires, tout en restant indépendant de la couche HTTP.
// ==============================================================================

const bcrypt = require('bcryptjs');
const User = require('../../models/auth/User');
const Role = require('../../models/auth/Role');
const tokenService = require('./tokenService'); // Service pour les tokens de DB
const { sendEmail } = require('../../config/email');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../config/jwt');
const { USER_ROLES } = require('../../utils/constants');
const { isStrongPassword } = require('../../utils/validators');

/**
 * Enregistre un nouvel utilisateur dans la base de données.
 * @param {object} userData - Données de l'utilisateur (firstName, lastName, email, password).
 * @returns {Promise<object>} L'objet utilisateur nouvellement créé (sans le mot de passe).
 * @throws {Error} Si l'email est déjà utilisé ou si le rôle par défaut n'est pas trouvé.
 */
async function registerUser(userData) {
  const { email, password, firstName, lastName } = userData;

  if (!isStrongPassword(password)) {
    throw new Error('Le mot de passe ne respecte pas les critères de sécurité.');
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
    firstName,
    lastName,
    email,
    password,
    role: defaultRole._id,
  });

  await newUser.save();

  // TODO: Envoyer un email de bienvenue ou de vérification d'email
  // await tokenService.createToken(newUser._id, 'emailVerification', 1);
  // ... envoyer l'email de vérification

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
  const user = await User.findOne({ email }).select('+password').populate('role');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new Error('Email ou mot de passe incorrect.');
  }

  if (!user.isActive) {
    throw new Error('Ce compte utilisateur a été désactivé.');
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.password = undefined;
  return { accessToken, refreshToken, user };
}

/**
 * Génère un nouvel access token en utilisant un refresh token valide.
 * @param {string} token - Le refresh token.
 * @returns {Promise<{accessToken: string}>}
 * @throws {Error} Si le refresh token est invalide.
 */
async function refreshAuthToken(token) {
  const decoded = verifyRefreshToken(token);
  if (!decoded) {
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
  const user = await User.findOne({ email });
  if (!user) {
    // Sécurité : ne pas révéler si l'email existe. On termine silencieusement.
    return;
  }

  const resetToken = await tokenService.createToken(user._id, 'passwordReset', 1);
  const resetURL = `${process.env.APP_URL}/reset-password/${resetToken}`;

  await sendEmail({
    to: user.email,
    subject: 'Réinitialisation de votre mot de passe - ERP Sénégal',
    // Idéalement, utiliser des templates HTML pour les emails.
    html: `<p>Bonjour ${user.firstName},</p><p>Pour réinitialiser votre mot de passe, veuillez cliquer sur ce <a href="${resetURL}">lien</a>. Le lien est valide pendant 24 heures.</p>`,
    text: `Bonjour ${user.firstName},\n\nPour réinitialiser votre mot de passe, veuillez copier ce lien dans votre navigateur : ${resetURL}\nLe lien est valide pendant 24 heures.`,
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

  user.password = newPassword; // Le hook pre-save du modèle hachera le mot de passe.
  await user.save();

  // Le token est utilisé, on le supprime.
  await tokenService.deleteToken(token, 'passwordReset');

  // TODO: Envoyer un email de confirmation de changement de mot de passe.
}


module.exports = {
  registerUser,
  loginUser,
  refreshAuthToken,
  requestPasswordReset,
  finalizePasswordReset,
};