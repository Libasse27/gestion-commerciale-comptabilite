// ==============================================================================
//                  MODULE DE GESTION DES JSON WEB TOKENS (JWT)
//
// Ce module centralise la création et la vérification des JWT.
// Il gère deux types de tokens pour une sécurité renforcée :
//
//  - Access Token : Courte durée de vie, utilisé pour accéder aux routes protégées.
//  - Refresh Token : Longue durée de vie, utilisé uniquement pour obtenir un
//                    nouvel Access Token.
//
// Les secrets et durées de vie sont lus depuis les variables d'environnement.
// ==============================================================================

const jwt = require('jsonwebtoken');
const { logger } = require('../middleware/logger');

/**
 * Génère un Access Token.
 * @param {string} userId - L'ID de l'utilisateur (payload du token).
 * @returns {string} Le token JWT signé.
 */
const generateAccessToken = (userId) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
    logger.error('CONFIG ERROR: JWT_SECRET ou JWT_EXPIRES_IN non défini dans .env');
    throw new Error('Configuration JWT invalide pour Access Token.');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Génère un Refresh Token.
 * @param {string} userId - L'ID de l'utilisateur (payload du token).
 * @returns {string} Le refresh token JWT signé.
 */
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET || !process.env.JWT_REFRESH_EXPIRES_IN) {
    logger.error('CONFIG ERROR: JWT_REFRESH_SECRET ou JWT_REFRESH_EXPIRES_IN non défini dans .env');
    throw new Error('Configuration JWT invalide pour Refresh Token.');
  }

  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Vérifie un Access Token.
 * @param {string} token - Le token à vérifier.
 * @returns {object | null} Le payload décodé si le token est valide, sinon null.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Il est normal qu'un token expire, donc on le log en 'warn' et non 'error'.
    logger.warn(`Échec de la vérification de l'Access Token: ${error.message}`);
    return null;
  }
};

/**
 * Vérifie un Refresh Token.
 * @param {string} token - Le refresh token à vérifier.
 * @returns {object | null} Le payload décodé si le token est valide, sinon null.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    logger.warn(`Échec de la vérification du Refresh Token: ${error.message}`);
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};