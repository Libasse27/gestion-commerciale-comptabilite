// ==============================================================================
//                  Configuration de la Gestion des JWT
//
// Ce module centralise la création et la vérification des JSON Web Tokens.
// Il utilise des secrets et des durées d'expiration distincts pour les
// access tokens (courte durée) et les refresh tokens (longue durée).
//
// Les secrets DOIVENT être définis dans le fichier .env et ne jamais
// être inscrits en dur dans le code.
// ==============================================================================

const jwt = require('jsonwebtoken');

/**
 * Génère un Access Token.
 * C'est le token principal, de courte durée, utilisé pour authentifier
 * la plupart des requêtes API.
 * @param {string} userId - L'identifiant unique de l'utilisateur (provenant de MongoDB).
 * @returns {string} Le token JWT signé.
 */
const generateAccessToken = (userId) => {
  if (!process.env.JWT_SECRET || !process.env.JWT_EXPIRES_IN) {
    throw new Error('JWT_SECRET ou JWT_EXPIRES_IN non défini dans .env');
  }

  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

/**
 * Génère un Refresh Token.
 * Ce token a une durée de vie plus longue et n'est utilisé que pour
 * obtenir un nouvel Access Token lorsque celui-ci est expiré.
 * @param {string} userId - L'identifiant unique de l'utilisateur.
 * @returns {string} Le refresh token JWT signé.
 */
const generateRefreshToken = (userId) => {
  if (!process.env.JWT_REFRESH_SECRET || !process.env.JWT_REFRESH_EXPIRES_IN) {
    throw new Error('JWT_REFRESH_SECRET ou JWT_REFRESH_EXPIRES_IN non défini dans .env');
  }

  return jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
  });
};

/**
 * Vérifie un Access Token.
 * @param {string} token - Le token à vérifier.
 * @returns {object | null} Le payload décodé du token si valide, sinon null.
 */
const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    // Les erreurs (TokenExpiredError, JsonWebTokenError) sont gérées en retournant null.
    // Le code appelant saura que le token est invalide.
    return null;
  }
};

/**
 * Vérifie un Refresh Token.
 * @param {string} token - Le refresh token à vérifier.
 * @returns {object | null} Le payload décodé du token si valide, sinon null.
 */
const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch (error) {
    return null;
  }
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};