// server/services/auth/authService.js
// ==============================================================================
//                Service d'Authentification (Logique Métier)
//
// Ce service orchestre la logique métier complexe pour l'authentification :
//   - Inscription, connexion, rafraîchissement de session.
//   - Processus complet de réinitialisation de mot de passe.
//   - Mise à jour du mot de passe par l'utilisateur connecté.
// ==============================================================================

const AppError = require('../../utils/appError');
const User = require('../../models/auth/User');
const Role = require('../../models/auth/Role');
const tokenService = require('./tokenService');
const { sendEmail } = require('../../config/email');
const { generateAccessToken, generateRefreshToken, verifyRefreshToken } = require('../../config/jwt');
const { USER_ROLES } = require('../../utils/constants');
const { isStrongPassword } = require('../../utils/validators');
const { capitalizeFirstLetter } = require('../../utils/helpers');

/**
 * Enregistre un nouvel utilisateur.
 */
async function registerUser(userData) {
  const { email, password, firstName, lastName } = userData;

  if (!isStrongPassword(password)) {
    throw new AppError('Le mot de passe ne respecte pas les critères de sécurité (8+ car., 1 maj., 1 min., 1 chiffre, 1 spécial).', 400);
  }

  if (await User.findOne({ email: email.toLowerCase() })) {
    throw new AppError('Un utilisateur avec cet email existe déjà.', 409); // 409 Conflict
  }

  const defaultRole = await Role.findOne({ name: USER_ROLES.VENDEUR });
  if (!defaultRole) {
    throw new AppError('Configuration système incomplète : rôle par défaut introuvable.', 500);
  }

  const newUser = await User.create({
    firstName: capitalizeFirstLetter(firstName),
    lastName: lastName.toUpperCase(),
    email: email.toLowerCase(),
    password,
    role: defaultRole._id,
  });

  newUser.password = undefined; // Ne pas renvoyer le mot de passe haché
  return newUser;
}

/**
 * Authentifie un utilisateur et génère des tokens.
 */
async function loginUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() })
    .select('+password')
    .populate({
      path: 'role',
      select: 'name permissions',
      populate: { path: 'permissions', select: 'name -_id' },
    });

  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Email ou mot de passe incorrect.', 401);
  }

  if (!user.isActive) {
    throw new AppError('Ce compte utilisateur a été désactivé.', 403);
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);
  
  const userToReturn = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role.name,
    permissions: user.role.permissions.map(p => p.name),
  };

  return { accessToken, refreshToken, user: userToReturn };
}

/**
 * Met à jour le mot de passe d'un utilisateur connecté.
 */
async function updateUserPassword(userId, currentPassword, newPassword) {
  if (!isStrongPassword(newPassword)) {
    throw new AppError('Le nouveau mot de passe ne respecte pas les critères de sécurité.', 400);
  }

  const user = await User.findById(userId).select('+password');
  if (!user || !(await user.comparePassword(currentPassword))) {
    throw new AppError('Votre mot de passe actuel est incorrect.', 401);
  }

  user.password = newPassword;
  await user.save();
  return;
}

/**
 * Génère un nouvel access token en utilisant un refresh token valide.
 */
async function refreshAuthToken(token) {
  const decoded = verifyRefreshToken(token);
  if (!decoded || !decoded.id) {
    throw new AppError('Refresh token invalide ou expiré.', 401);
  }

  const user = await User.findById(decoded.id);
  if (!user || !user.isActive) {
    throw new AppError('Utilisateur introuvable ou compte désactivé.', 401);
  }
  
  if (user.passwordChangedAfter(decoded.iat)) {
      throw new AppError('Le mot de passe a été changé. Veuillez vous reconnecter.', 401);
  }

  const accessToken = generateAccessToken(user._id);
  return { accessToken };
}

/**
 * Gère la demande de réinitialisation de mot de passe.
 */
async function requestPasswordReset(email) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    const resetToken = await tokenService.createToken(user._id, 'passwordReset', 1);
    const resetURL = `${process.env.APP_URL}/reset-password/${resetToken}`;

    // TODO: Utiliser un service de templating d'email plus avancé (ex: Pug, EJS)
    await sendEmail({
      to: user.email,
      subject: `Réinitialisation de votre mot de passe - ${process.env.APP_NAME}`,
      html: `<p>Bonjour ${user.firstName},</p><p>Pour réinitialiser votre mot de passe, veuillez cliquer sur ce <a href="${resetURL}">lien</a>. Le lien expirera dans 24 heures.</p>`,
    });
  }
  // Ne rien faire et ne rien renvoyer si l'utilisateur n'est pas trouvé.
  return;
}

/**
 * Finalise la réinitialisation du mot de passe.
 */
async function finalizePasswordReset(token, newPassword) {
  if (!isStrongPassword(newPassword)) {
    throw new AppError('Le nouveau mot de passe ne respecte pas les critères de sécurité.', 400);
  }

  const tokenDoc = await tokenService.validateToken(token, 'passwordReset');

  const user = await User.findById(tokenDoc.userId);
  if (!user) {
    throw new AppError('Utilisateur associé au token introuvable.', 400);
  }

  user.password = newPassword;
  await user.save();
  await tokenService.deleteToken(token, 'passwordReset');
}


module.exports = {
  registerUser,
  loginUser,
  updateUserPassword,
  refreshAuthToken,
  requestPasswordReset,
  finalizePasswordReset,
};