// server/utils/encryption.js
// ==============================================================================
//           Utilitaire de Chiffrement et Déchiffrement Symétrique
//
// Ce module fournit des fonctions pour chiffrer et déchiffrer des données
// en utilisant l'algorithme AES-256-GCM, un standard de chiffrement
// authentifié robuste.
//
// !! ATTENTION !!
// - Cet utilitaire N'EST PAS destiné au stockage des mots de passe. Pour les mots
//   de passe, utilisez TOUJOURS un algorithme de hachage à sens unique comme bcrypt.
// - Ce module est utile pour chiffrer des données que vous devez pouvoir
//   déchiffrer plus tard (ex: clés d'API, certaines données PII).
//
// Il repose sur une clé de chiffrement principale (`ENCRYPTION_KEY`) qui doit
// être définie dans le fichier .env et gardée absolument secrète.
// ==============================================================================

const crypto = require('crypto');
const { logger } = require('../middleware/logger');

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const SALT_LENGTH = 64;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;
const PBKDF2_ITERATIONS = 100000;

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < KEY_LENGTH) {
  logger.error('CRITICAL CONFIG ERROR: ENCRYPTION_KEY est manquante ou trop courte dans .env. Elle doit faire au moins 32 caractères.');
  // Dans une application réelle, on pourrait vouloir arrêter le serveur :
  // process.exit(1);
}

/**
 * Chiffre une chaîne de texte.
 * @param {string} text - Le texte à chiffrer.
 * @returns {string | null} Le texte chiffré, encodé en base64, ou null si l'entrée est vide.
 */
function encrypt(text) {
  if (!text) return null;

  try {
    const salt = crypto.randomBytes(SALT_LENGTH);
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
    const tag = cipher.getAuthTag();

    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  } catch (error) {
    logger.error('Erreur lors du chiffrement.', { error });
    return null;
  }
}

/**
 * Déchiffre une chaîne de texte chiffrée par la fonction `encrypt`.
 * @param {string} encryptedText - Le texte chiffré encodé en base64.
 * @returns {string | null} Le texte original, ou null en cas d'erreur.
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;

  try {
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');

    const salt = encryptedBuffer.slice(0, SALT_LENGTH);
    const iv = encryptedBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    logger.error('Erreur lors du déchiffrement (potentiellement une altération des données ou une mauvaise clé).', { errorMessage: error.message });
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt,
};