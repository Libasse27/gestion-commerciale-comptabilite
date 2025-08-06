// server/services/auth/tokenService.js
// ==============================================================================
//                Service de Gestion des Tokens Spécifiques
//
// Ce service gère la création, la validation et la suppression de tokens
// à usage unique (ex: réinitialisation de mot de passe).
// Le token est haché avant d'être stocké en DB pour plus de sécurité.
// ==============================================================================

const crypto = require('crypto');
const Token = require('../../models/auth/Token');
const { addDaysToDate } = require('../../utils/dateUtils');
const AppError = require('../../utils/appError');

/**
 * Hache un token en utilisant SHA256.
 * @private
 */
const _hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Crée un token pour un utilisateur et sauvegarde sa version hachée en DB.
 * @param {string} userId - L'ID de l'utilisateur.
 * @param {'passwordReset' | 'emailVerification' | 'invite'} type - Le type de token.
 * @param {number} [validityInDays=1] - La durée de validité du token en jours.
 * @returns {Promise<string>} Le token en clair, à envoyer à l'utilisateur.
 */
async function createToken(userId, type, validityInDays = 1) {
  // 1. Supprimer les anciens tokens du même type pour cet utilisateur
  await Token.deleteMany({ userId, type });

  // 2. Générer un token en clair
  const plainToken = crypto.randomBytes(32).toString('hex');

  // 3. Hacher le token pour le stockage
  const hashedToken = _hashToken(plainToken);

  // 4. Calculer la date d'expiration
  const expiresAt = addDaysToDate(new Date(), validityInDays);

  // 5. Sauvegarder le nouveau token (version hachée)
  await Token.create({
    userId,
    token: hashedToken,
    type,
    expiresAt,
  });

  // 6. Renvoyer le token en clair pour l'envoyer à l'utilisateur
  return plainToken;
}

/**
 * Valide un token fourni par un utilisateur.
 * @param {string} plainToken - Le token en clair fourni par l'utilisateur.
 * @param {'passwordReset' | 'emailVerification' | 'invite'} type - Le type de token à valider.
 * @returns {Promise<Document>} Le document Token trouvé et valide.
 * @throws {AppError} Si le token est invalide ou a expiré.
 */
async function validateToken(plainToken, type) {
  if (!plainToken || !type) {
    throw new AppError('Token invalide ou manquant.', 400);
  }

  // 1. Hacher le token fourni pour le comparer à celui en DB
  const hashedToken = _hashToken(plainToken);

  // 2. Chercher le token haché dans la base de données
  const tokenDoc = await Token.findOne({
    token: hashedToken,
    type: type,
    expiresAt: { $gt: new Date() },
  });

  if (!tokenDoc) {
    throw new AppError('Le token est invalide ou a expiré.', 400);
  }

  return tokenDoc;
}

/**
 * Supprime un token de la base de données après son utilisation.
 * @param {string} plainToken - Le token en clair à supprimer.
 * @param {'passwordReset' | 'emailVerification' | 'invite'} type - Le type de token.
 * @returns {Promise<void>}
 */
async function deleteToken(plainToken, type) {
  if (!plainToken || !type) return;
  const hashedToken = _hashToken(plainToken);
  await Token.deleteOne({ token: hashedToken, type });
}

module.exports = {
  createToken,
  validateToken,
  deleteToken,
};