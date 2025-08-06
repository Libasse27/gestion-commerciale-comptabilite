// server/controllers/auth/authController.js
// ==============================================================================
//           Contrôleur pour l'Authentification des Utilisateurs
//
// Gère l'inscription, la connexion, la déconnexion, le rafraîchissement
// de token et le processus de réinitialisation de mot de passe.
// ==============================================================================

const authService = require('../../services/auth/authService');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const auditLogService = require('../../services/system/auditLogService');
const { AUDIT_LOG_ACTIONS } = require('../../utils/constants');

/**
 * Fonction helper pour envoyer une réponse avec les tokens et configurer le cookie.
 */
const sendTokenResponse = (res, statusCode, { user, accessToken, refreshToken }) => {
  const cookieOptions = {
    httpOnly: true, // Empêche l'accès via JavaScript côté client
    secure: process.env.NODE_ENV === 'production', // Uniquement en HTTPS
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
  };
  res.cookie('refreshToken', refreshToken, cookieOptions);
  
  // Renvoyer l'access token et les données utilisateur dans le corps de la réponse
  res.status(statusCode).json({
    status: 'success',
    accessToken,
    data: { user }
  });
};

/** @desc Inscrire un nouvel utilisateur */
exports.register = asyncHandler(async (req, res, next) => {
  const newUser = await authService.registerUser(req.body);
  const tokenData = await authService.loginUser(req.body.email, req.body.password);
  
  auditLogService.logCreate({
    user: newUser._id, entity: 'User',
    entityId: newUser._id, ipAddress: req.ip,
  });
  
  sendTokenResponse(res, 201, tokenData);
});

/** @desc Connecter un utilisateur */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Veuillez fournir un email et un mot de passe.', 400));
  }
  
  try {
    const tokenData = await authService.loginUser(email, password);
    auditLogService.logSystemEvent({
      user: tokenData.user.id, action: AUDIT_LOG_ACTIONS.LOGIN_SUCCESS,
      status: 'SUCCESS', ipAddress: req.ip,
    });
    sendTokenResponse(res, 200, tokenData);
  } catch (error) {
    auditLogService.logSystemEvent({
      action: AUDIT_LOG_ACTIONS.LOGIN_FAILURE, status: 'FAILURE',
      ipAddress: req.ip, details: `Tentative pour: ${email}. Raison: ${error.message}`
    });
    return next(error);
  }
});

/** @desc Mettre à jour le mot de passe de l'utilisateur connecté */
exports.updateMyPassword = asyncHandler(async (req, res, next) => {
    const { currentPassword, newPassword } = req.body;
    await authService.updateUserPassword(req.user.id, currentPassword, newPassword);
    
    auditLogService.logSystemEvent({
      user: req.user.id, action: AUDIT_LOG_ACTIONS.UPDATE, status: 'SUCCESS',
      ipAddress: req.ip, entity: 'User', entityId: req.user.id,
      details: 'Mise à jour du mot de passe personnel.'
    });

    res.status(200).json({ status: 'success', message: 'Mot de passe mis à jour avec succès.' });
});

/** @desc Rafraîchir un access token */
exports.refreshToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return next(new AppError('Refresh token manquant.', 401));
  const { accessToken } = await authService.refreshAuthToken(refreshToken);
  res.status(200).json({ status: 'success', accessToken });
});

/** @desc Se déconnecter */
exports.logout = asyncHandler(async (req, res, next) => {
  if (req.user) {
    auditLogService.logSystemEvent({
      user: req.user.id, action: AUDIT_LOG_ACTIONS.LOGOUT,
      status: 'SUCCESS', ipAddress: req.ip,
    });
  }
  res.cookie('refreshToken', 'loggedout', {
    expires: new Date(Date.now() + 5 * 1000), httpOnly: true,
  });
  res.status(200).json({ status: 'success' });
});

/** @desc Demander une réinitialisation de mot de passe */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  if (!email) return next(new AppError('Veuillez fournir une adresse email.', 400));
  
  await authService.requestPasswordReset(email);
  
  auditLogService.logSystemEvent({
    action: AUDIT_LOG_ACTIONS.PASSWORD_RESET_REQUEST, status: 'SUCCESS',
    ipAddress: req.ip, details: { email }
  });
  
  res.status(200).json({ status: 'success', message: 'Si un compte correspondant à cet email existe, un lien de réinitialisation a été envoyé.' });
});

/** @desc Réinitialiser le mot de passe avec un token */
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const { token } = req.params;
  const { password } = req.body;
  if (!password) return next(new AppError('Veuillez fournir un nouveau mot de passe.', 400));
  
  await authService.finalizePasswordReset(token, password);
  
  auditLogService.logSystemEvent({
    action: AUDIT_LOG_ACTIONS.PASSWORD_RESET_SUCCESS, status: 'SUCCESS',
    ipAddress: req.ip,
  });
  
  res.status(200).json({ status: 'success', message: 'Votre mot de passe a été réinitialisé avec succès.' });
});