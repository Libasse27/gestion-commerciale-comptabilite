// ==============================================================================
//           Contrôleur pour l'Authentification des Utilisateurs
//
// Gère l'inscription, la connexion, la déconnexion, le rafraîchissement
// de token et le processus de réinitialisation de mot de passe.
// S'intègre avec le service d'audit pour tracer les actions sensibles.
// ==============================================================================

const authService = require('../../services/auth/authService');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const auditLogService = require('../../services/system/auditLogService'); // À créer
const { AUDIT_LOG_ACTIONS, USER_ROLES } = require('../../utils/constants');
const User = require('../../models/auth/User');
const Role = require('../../models/auth/Role');
const { isStrongPassword } = require('../../utils/validators');

/**
 * Fonction helper pour envoyer une réponse avec les tokens et configurer le cookie.
 */
const sendTokenResponse = (res, statusCode, { user, accessToken, refreshToken }) => {
  const cookieOptions = {
    httpOnly: true, // Empêche l'accès via JavaScript côté client
    secure: process.env.NODE_ENV === 'production', // Uniquement sur HTTPS en production
    // Le 'expires' est mieux géré par le navigateur avec maxAge
    maxAge: parseInt(process.env.JWT_REFRESH_EXPIRES_IN_DAYS) * 24 * 60 * 60 * 1000,
  };

  res.cookie('refreshToken', refreshToken, cookieOptions);

  // L'objet user est déjà formaté par le service, pas besoin de manipuler le mot de passe ici.
  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: { user },
  });
};


/**
 * @desc    [INITIALISATION] Crée les rôles et le premier Admin du système.
 * @route   POST /api/v1/auth/initialize
 * @access  Public (uniquement si aucun utilisateur n'existe)
 */
exports.initializeSystem = asyncHandler(async (req, res, next) => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return next(new AppError('Le système a déjà été initialisé.', 403));
  }
  
  // Création des rôles de base
  for (const roleName of Object.values(USER_ROLES)) {
    const roleExists = await Role.findOne({ name: roleName });
    if (!roleExists) await Role.create({ name: roleName, description: `Rôle de ${roleName}` });
  }

  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
    return next(new AppError('Veuillez fournir toutes les informations pour créer le compte admin.', 400));
  }
  
  if(!isStrongPassword(password)) {
    return next(new AppError('Le mot de passe administrateur ne respecte pas les critères de sécurité.', 400));
  }

  const adminRole = await Role.findOne({ name: USER_ROLES.ADMIN });
  const adminUser = await User.create({ firstName, lastName, email, password, role: adminRole._id, isActive: true });
  
  adminUser.password = undefined;

  await auditLogService.logAction({
    action: AUDIT_LOG_ACTIONS.CREATE, entity: 'System', entityId: adminUser._id,
    status: 'SUCCESS', ipAddress: req.ip, details: 'Initialisation du système et création du premier admin.'
  });

  res.status(201).json({
    status: 'success',
    message: 'Système initialisé. Le compte Administrateur a été créé.',
    data: { user: adminUser },
  });
});


/**
 * @desc    Inscrire un nouvel utilisateur
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  const newUser = await authService.registerUser({ firstName, lastName, email, password });
  const tokenData = await authService.loginUser(email, password);

  await auditLogService.logAction({
    user: tokenData.user.id, action: AUDIT_LOG_ACTIONS.CREATE, entity: 'User',
    entityId: tokenData.user.id, status: 'SUCCESS', ipAddress: req.ip,
    details: 'Inscription d\'un nouvel utilisateur.'
  });

  sendTokenResponse(res, 201, tokenData);
});


/**
 * @desc    Connecter un utilisateur
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
exports.login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Veuillez fournir un email et un mot de passe.', 400));
    }
    
    const tokenData = await authService.loginUser(email, password);

    await auditLogService.logAction({
      user: tokenData.user.id, action: AUDIT_LOG_ACTIONS.LOGIN_SUCCESS, entity: 'System',
      status: 'SUCCESS', ipAddress: req.ip,
    });

    sendTokenResponse(res, 200, tokenData);
  } catch (error) {
    await auditLogService.logAction({
      action: AUDIT_LOG_ACTIONS.LOGIN_FAILURE, entity: 'System', status: 'FAILURE',
      ipAddress: req.ip, details: `Tentative de connexion échouée pour l'email : ${req.body.email}. Raison: ${error.message}`
    });
    // On passe l'erreur au gestionnaire global qui renverra la bonne réponse.
    return next(error);
  }
});


/**
 * @desc    Rafraîchir un access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Privé (nécessite un cookie refreshToken valide)
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    return next(new AppError('Accès non autorisé. Refresh token manquant.', 401));
  }
  const { accessToken } = await authService.refreshAuthToken(refreshToken);
  res.status(200).json({ status: 'success', accessToken });
});


/**
 * @desc    Se déconnecter
 * @route   POST /api/v1/auth/logout
 * @access  Privé (nécessite un token d'accès valide)
 */
exports.logout = asyncHandler(async (req, res, next) => {
  await auditLogService.logAction({
    user: req.user.id, action: AUDIT_LOG_ACTIONS.LOGOUT, entity: 'System',
    status: 'SUCCESS', ipAddress: req.ip,
  });

  // Efface le cookie en le remplaçant par un cookie expiré.
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });
  res.status(200).json({ status: 'success', message: 'Déconnexion réussie.' });
});


/**
 * @desc    Demander une réinitialisation de mot de passe
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Veuillez fournir une adresse email.', 400));
  }

  await authService.requestPasswordReset(email);

  await auditLogService.logAction({
    action: AUDIT_LOG_ACTIONS.PASSWORD_RESET_REQUEST, entity: 'System', status: 'SUCCESS',
    ipAddress: req.ip, details: { email: email }
  });

  res.status(200).json({
    status: 'success',
    message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.',
  });
});


/**
 * @desc    Réinitialiser le mot de passe
 * @route   PATCH /api/v1/auth/reset-password/:token
 * @access  Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) {
    return next(new AppError('Veuillez fournir un nouveau mot de passe.', 400));
  }
  
  await authService.finalizePasswordReset(token, password);
  
  await auditLogService.logAction({
    action: AUDIT_LOG_ACTIONS.PASSWORD_RESET_SUCCESS, entity: 'System', status: 'SUCCESS',
    ipAddress: req.ip, details: 'Mot de passe réinitialisé avec succès via token.'
  });

  res.status(200).json({
    status: 'success',
    message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
  });
});