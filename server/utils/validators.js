// ==============================================================================
//                  Fonctions de Validation Personnalisées
//
// Ce fichier contient des fonctions de validation réutilisables pour les
// données de l'application. Elles sont conçues pour être utilisées avec des
// bibliothèques comme `express-validator` ou directement dans les services.
//
// Le but est de centraliser la logique de validation métier pour garantir
// la cohérence et la maintenabilité.
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Vérifie si une chaîne de caractères est un ID MongoDB valide.
 * @param {string} id - La chaîne à valider.
 * @returns {boolean} `true` si l'ID est valide, sinon `false`.
 */
const isMongoId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Vérifie si un mot de passe respecte les critères de sécurité.
 * Critères : au moins 8 caractères, une majuscule, une minuscule, un chiffre, un caractère spécial.
 * @param {string} password - Le mot de passe à valider.
 * @returns {boolean} `true` si le mot de passe est fort, sinon `false`.
 */
const isStrongPassword = (password) => {
  if (!password) return false;
  // Regex: au moins 8 caractères, 1 minuscule, 1 majuscule, 1 chiffre, 1 caractère spécial
  const strongPasswordRegex = new RegExp(
    '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})'
  );
  return strongPasswordRegex.test(password);
};

/**
 * Valide un numéro de téléphone sénégalais.
 * Doit contenir 9 chiffres et commencer par 77, 78, 76, 70, ou 75.
 * @param {string | number} phone - Le numéro de téléphone à valider.
 * @returns {boolean} `true` si le numéro est valide, sinon `false`.
 */
const isValidSenegalPhone = (phone) => {
  if (!phone) return false;
  const phoneStr = phone.toString().replace(/\s+/g, ''); // Enlève les espaces

  const validPrefixes = Object.freeze(['77', '78', '76', '70', '75']);
  const phoneRegex = new RegExp(`^(${validPrefixes.join('|')})\\d{7}$`);

  return phoneRegex.test(phoneStr);
};

/**
 * Valide un numéro NINEA (Numéro d'Identification National des Entreprises et des Associations) sénégalais.
 * Note : Ceci est une validation de format simple. Une validation réelle pourrait nécessiter un algorithme de clé de contrôle.
 * Exemple de format (à adapter) : 9 chiffres.
 * @param {string} ninea - Le numéro NINEA à valider.
 * @returns {boolean} `true` si le format est valide, sinon `false`.
 */
const isValidNINEA = (ninea) => {
  if (!ninea) return false;
  const nineaRegex = /^[0-9]{9}$/; // Exemple simple : 9 chiffres exactement
  return nineaRegex.test(ninea);
};

/**
 * Vérifie si une valeur est un pourcentage valide (entre 0 et 100).
 * @param {number} value - La valeur à vérifier.
 * @returns {boolean} `true` si c'est un pourcentage valide.
 */
const isPercentage = (value) => {
  const num = Number(value);
  return !isNaN(num) && num >= 0 && num <= 100;
};

/**
 * Vérifie si une valeur est un nombre strictement positif.
 * @param {number} value - La valeur à vérifier.
 * @returns {boolean} `true` si la valeur est supérieure à 0.
 */
const isGreaterThanZero = (value) => {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

module.exports = {
  isMongoId,
  isStrongPassword,
  isValidSenegalPhone,
  isValidNINEA,
  isPercentage,
  isGreaterThanZero,
};