// ==============================================================================
//                Service de Gestion des Tokens Spécifiques
//
// Ce service gère la création, la validation et la suppression de tokens
// spécifiques stockés en base de données, tels que :
//   - Tokens de réinitialisation de mot de passe.
//   - Tokens de vérification d'email.
//
// Il ne gère PAS les tokens JWT d'authentification, qui sont sans état (stateless)
// et gérés par le module /config/jwt.js.
// Pour plus de sécurité, le token est haché avant d'être stocké en DB.
// ==============================================================================

const crypto = require('crypto');
const Token = require('../../models/auth/Token'); // Ce modèle est à créer
const { addDaysToDate } = require('../../utils/dateUtils');

/**
 * Crée un token pour un utilisateur et sauvegarde sa version hachée en DB.
 * @param {import('mongoose').Types.ObjectId} userId - L'ID de l'utilisateur.
 * @param {'passwordReset' | 'emailVerification' | 'invite'} type - Le type de token.
 * @param {number} validityInDays - La durée de validité du token en jours.
 * @returns {Promise<string>} Le token généré en clair (à envoyer à l'utilisateur).
 */
async function createToken(userId, type, validityInDays = 1) {
  // 1. Supprimer tout token existant du même type pour cet utilisateur
  await Token.deleteMany({ userId, type });

  // 2. Générer un token en clair, aléatoire et sécurisé
  const plainToken = crypto.randomBytes(32).toString('hex');

  // 3. Hacher le token pour un stockage sécurisé
  const hashedToken = crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');

  // 4. Calculer la date d'expiration
  const expiresAt = addDaysToDate(new Date(), validityInDays);

  // 5. Créer et sauvegarder le nouveau token (version hachée)
  const token = new Token({
    userId,
    token: hashedToken,
    type,
    expiresAt,
  });

  await token.save();

  // 6. Renvoyer le token en clair pour qu'il soit envoyé à l'utilisateur
  return plainToken;
}

/**
 * Valide un token fourni par un utilisateur en le comparant à la version hachée en DB.
 * @param {string} plainToken - Le token en clair à vérifier.
 * @param {'passwordReset' | 'emailVerification' | 'invite'} type - Le type de token attendu.
 * @returns {Promise<import('mongoose').Document | null>} Le document Token s'il est valide, sinon null.
 */
async function validateToken(plainToken, type) {
  if (!plainToken || !type) {
    return null;
  }

  // 1. Hacher le token fourni par l'utilisateur pour le comparer à celui en DB
  const hashedToken = crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');

  // 2. Chercher le token haché dans la base de données
  const tokenDoc = await Token.findOne({
    token: hashedToken,
    type: type,
    expiresAt: { $gt: Date.now() }, // Vérifier que le token n'est pas expiré
  });

  // Si aucun document n'est trouvé, le token est invalide ou expiré
  if (!tokenDoc) {
    return null;
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
  if (!plainToken || !type) {
    return;
  }

  const hashedToken = crypto
    .createHash('sha256')
    .update(plainToken)
    .digest('hex');

  await Token.deleteOne({ token: hashedToken, type });
}

module.exports = {
  createToken,
  validateToken,
  deleteToken,
};