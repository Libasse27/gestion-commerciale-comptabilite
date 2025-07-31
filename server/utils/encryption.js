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

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;       // Pour GCM, la taille de l'IV est généralement de 12 ou 16 bytes.
const SALT_LENGTH = 64;     // Longueur du sel pour la dérivation de la clé.
const TAG_LENGTH = 16;      // Longueur du tag d'authentification GCM (toujours 16 pour GCM).
const KEY_LENGTH = 32;      // Pour AES-256, la clé doit faire 32 bytes (256 bits).
const PBKDF2_ITERATIONS = 100000; // Un bon nombre d'itérations pour PBKDF2.

// Récupération de la clé principale depuis les variables d'environnement.
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY;

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length < KEY_LENGTH) {
  console.error('❌ Erreur: ENCRYPTION_KEY est manquante ou trop courte dans .env. Elle doit faire au moins 32 caractères.');
  // Dans une application réelle, vous pourriez vouloir arrêter le serveur.
  // process.exit(1);
}

/**
 * Chiffre une chaîne de texte.
 * @param {string} text - Le texte à chiffrer.
 * @returns {string | null} Le texte chiffré, encodé en base64, incluant le sel, l'IV et le tag, ou null si l'entrée est vide.
 */
function encrypt(text) {
  if (!text) return null;

  try {
    // 1. Générer un sel aléatoire pour chaque chiffrement.
    const salt = crypto.randomBytes(SALT_LENGTH);

    // 2. Dériver une clé de chiffrement à partir de la clé principale et du sel.
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');

    // 3. Générer un vecteur d'initialisation (IV) aléatoire.
    const iv = crypto.randomBytes(IV_LENGTH);

    // 4. Créer le cipher avec la clé dérivée et l'IV.
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    // 5. Chiffrer le texte.
    const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);

    // 6. Obtenir le tag d'authentification (essentiel pour GCM).
    const tag = cipher.getAuthTag();

    // 7. Concaténer sel, IV, tag et texte chiffré, puis encoder en base64 pour le stockage.
    return Buffer.concat([salt, iv, tag, encrypted]).toString('base64');
  } catch (error) {
    console.error('Erreur lors du chiffrement:', error);
    return null;
  }
}

/**
 * Déchiffre une chaîne de texte chiffrée par la fonction `encrypt`.
 * @param {string} encryptedText - Le texte chiffré encodé en base64.
 * @returns {string | null} Le texte original, ou null en cas d'erreur ou d'échec de l'authentification.
 */
function decrypt(encryptedText) {
  if (!encryptedText) return null;

  try {
    // 1. Décoder la chaîne base64 en buffer.
    const encryptedBuffer = Buffer.from(encryptedText, 'base64');

    // 2. Extraire le sel, l'IV, le tag et le texte chiffré du buffer.
    const salt = encryptedBuffer.slice(0, SALT_LENGTH);
    const iv = encryptedBuffer.slice(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
    const tag = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
    const encrypted = encryptedBuffer.slice(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);

    // 3. Dériver la même clé en utilisant le même sel.
    const key = crypto.pbkdf2Sync(ENCRYPTION_KEY, salt, PBKDF2_ITERATIONS, KEY_LENGTH, 'sha512');

    // 4. Créer le decipher avec la clé, l'IV et le tag d'authentification.
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(tag);

    // 5. Déchiffrer le texte.
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);

    return decrypted.toString('utf8');
  } catch (error) {
    // Si le tag d'authentification est invalide, une erreur sera levée ici.
    // Cela signifie que les données ont été altérées ou que la clé est incorrecte.
    console.error('Erreur lors du déchiffrement (potentiellement une altération des données):', error);
    return null;
  }
}

module.exports = {
  encrypt,
  decrypt,
};