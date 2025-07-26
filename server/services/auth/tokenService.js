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
// ==============================================================================

const crypto = require('crypto');
const Token = require('../../models/auth/Token');
const { addDaysToDate } = require('../../utils/dateUtils'); // Notre utilitaire de date

/**
 * Crée un token pour un utilisateur et le sauvegarde en base de données.
 * @param {mongoose.Types.ObjectId} userId - L'ID de l'utilisateur.
 * @param {'passwordReset' | 'emailVerification' | 'invite'} type - Le type de token.
 * @param {number} validityInDays - La durée de validité du token en jours.
 * @returns {Promise<string>} Le token généré en clair (à envoyer à l'utilisateur).
 */
async function createToken(userId, type, validityInDays = 1) {
  // 1. Supprimer tout token existant du même type pour cet utilisateur
  await Token.deleteMany({ userId, type });

  // 2. Générer un token aléatoire et sécurisé
  const plainToken = crypto.randomBytes(32).toString('hex');

  // 3. Calculer la date d'expiration
  const expiresAt = addDaysToDate(new Date(), validityInDays);

  // 4. Créer et sauvegarder le nouveau token dans la base de données
  const token = new Token({
    userId,
    token: plainToken, // Pour l'instant, nous stockons le token en clair. Pour plus de sécurité, on pourrait le hacher.
    type,
    expiresAt,
  });

  await token.save();

  return plainToken;
}

/**
 * Valide un token fourni par un utilisateur.
 * @param {string} plainToken - Le token en clair à vérifier.
 * @param {'passwordReset' | 'emailVerification' | 'invite'} type - Le type de token attendu.
 * @returns {Promise<mongoose.Document | null>} Le document Token s'il est valide, sinon null.
 */
async function validateToken(plainToken, type) {
  if (!plainToken || !type) {
    return null;
  }

  // Pour une sécurité accrue, il serait préférable de hacher le token avant de le stocker
  // et de comparer les versions hachées. Pour la simplicité, nous comparons en clair.
  const tokenDoc = await Token.findOne({
    token: plainToken,
    type: type,
  });

  // Le token n'existe pas ou a été supprimé par l'index TTL car il est expiré.
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
  await Token.deleteOne({ token: plainToken, type });
}

module.exports = {
  createToken,
  validateToken,
  deleteToken,
};