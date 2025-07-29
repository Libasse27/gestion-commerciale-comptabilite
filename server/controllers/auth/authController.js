// ==============================================================================
//           Contrôleur pour l'Authentification des Utilisateurs
//
// MISE À JOUR : Intégration du journal d'audit pour tracer les événements
// de connexion, d'échec de connexion et de déconnexion.
// ==============================================================================

const authService = require('../../services/auth/authService');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const auditLogService = require('../../services/system/auditLogService');
const { AUDIT_LOG_ACTIONS } = require('../../utils/constants');

// Importation des modèles nécessaires pour la logique d'initialisation
const User = require('../../models/auth/User');
const Role = require('../../models/auth/Role');
const { USER_ROLES } = require('../../utils/constants');


/**
 * Fonction helper pour envoyer une réponse avec les tokens.
 */
const sendTokenResponse = (res, statusCode, { user, accessToken, refreshToken }) => {
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: new Date(
      Date.now() + process.env.JWT_REFRESH_EXPIRES_IN_DAYS * 24 * 60 * 60 * 1000
    ),
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: { user },
  });
};


/**
 * @desc    [INITIALISATION] Crée les rôles et le premier Admin.
 * @route   POST /api/v1/auth/initialize
 */
exports.initializeAdmin = asyncHandler(async (req, res, next) => {
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    return next(new AppError('Le système a déjà été initialisé.', 403));
  }
  
  for (const roleName of Object.values(USER_ROLES)) {
      const roleExists = await Role.findOne({ name: roleName });
      if (!roleExists) await Role.create({ name: roleName, description: `Rôle de ${roleName}` });
  }

  const { firstName, lastName, email, password } = req.body;
  if (!firstName || !lastName || !email || !password) {
      return next(new AppError('Veuillez fournir toutes les informations pour créer le compte admin.', 400));
  }
  const adminRole = await Role.findOne({ name: USER_ROLES.ADMIN });
  const adminUser = await User.create({ firstName, lastName, email, password, role: adminRole._id, isActive: true });
  
  adminUser.password = undefined;

  auditLogService.logAction({
      user: adminUser._id, action: AUDIT_LOG_ACTIONS.CREATE, entity: 'System',
      entityId: adminUser._id, status: 'SUCCESS', ipAddress: req.ip,
      details: 'Initialisation du système et création du premier admin.'
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
 */
exports.register = asyncHandler(async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;
  await authService.registerUser({ firstName, lastName, email, password });
  const tokenData = await authService.loginUser(email, password);

  auditLogService.logAction({
      user: tokenData.user._id, action: AUDIT_LOG_ACTIONS.CREATE, entity: 'User',
      entityId: tokenData.user._id, status: 'SUCCESS', ipAddress: req.ip,
      details: 'Inscription d\'un nouvel utilisateur.'
  });

  sendTokenResponse(res, 201, tokenData);
});


/**
 * @desc    Connecter un utilisateur
 * @route   POST /api/v1/auth/login
 */
exports.login = asyncHandler(async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return next(new AppError('Veuillez fournir un email et un mot de passe.', 400));
    }
    
    const tokenData = await authService.loginUser(email, password);

    auditLogService.logAction({
        user: tokenData.user._id, action: AUDIT_LOG_ACTIONS.LOGIN_SUCCESS, entity: 'System',
        status: 'SUCCESS', ipAddress: req.ip,
    });

    sendTokenResponse(res, 200, tokenData);
  } catch (error) {
    auditLogService.logAction({
        action: AUDIT_LOG_ACTIONS.LOGIN_FAILURE, entity: 'System',
        status: 'FAILURE', ipAddress: req.ip,
        details: { email: req.body.email, error: error.message }
    });
    return next(error);
  }
});


/**
 * @desc    Rafraîchir un access token
 * @route   POST /api/v1/auth/refresh-token
 */
exports.refreshToken = asyncHandler(async (req, res, next) => {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
        return next(new AppError('Refresh token non trouvé.', 401));
    }
    const { accessToken } = await authService.refreshAuthToken(refreshToken);
    res.status(200).json({ status: 'success', accessToken });
});


/**
 * @desc    Se déconnecter
 * @route   POST /api/v1/auth/logout
 */
exports.logout = (req, res) => {
    auditLogService.logAction({
        user: req.user.id, // req.user est fourni par le middleware d'authentification
        action: AUDIT_LOG_ACTIONS.LOGOUT, entity: 'System',
        status: 'SUCCESS', ipAddress: req.ip,
    });

    res.cookie('refreshToken', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({ status: 'success' });
};


/**
 * @desc    Demander une réinitialisation de mot de passe
 * @route   POST /api/v1/auth/forgot-password
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) {
    return next(new AppError('Veuillez fournir une adresse email.', 400));
  }

  await authService.requestPasswordReset(email);

  auditLogService.logAction({
      action: AUDIT_LOG_ACTIONS.PASSWORD_RESET_REQUEST, entity: 'System',
      status: 'SUCCESS', ipAddress: req.ip,
      details: { email: email }
  });

  res.status(200).json({
    status: 'success',
    message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.',
  });
});


/**
 * @desc    Réinitialiser le mot de passe
 * @route   PATCH /api/v1/auth/reset-password/:token
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) {
    return next(new AppError('Veuillez fournir un nouveau mot de passe.', 400));
  }
  
  await authService.finalizePasswordReset(token, password);
  
  auditLogService.logAction({
      action: AUDIT_LOG_ACTIONS.PASSWORD_RESET_SUCCESS, entity: 'System',
      status: 'SUCCESS', ipAddress: req.ip,
  });

  res.status(200).json({
      status: 'success',
      message: 'Votre mot de passe a été réinitialisé avec succès. Vous pouvez maintenant vous connecter.'
  });
});