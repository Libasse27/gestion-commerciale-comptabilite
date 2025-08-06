// client/src/utils/validators.js
// ==============================================================================
//                  Fonctions de Validation pour Formulaires (Client)
//
// Ces fonctions sont conçues pour être utilisées dans les formulaires afin de
// fournir un retour instantané à l'utilisateur.
// ==============================================================================

/**
 * Vérifie si une valeur est vide (chaîne vide, null, undefined).
 * @param {*} value - La valeur à vérifier.
 * @returns {string | undefined} Un message d'erreur si la valeur est vide.
 */
export const isRequired = (value) => {
  return value && String(value).trim().length > 0
    ? undefined
    : 'Ce champ est obligatoire.';
};

/**
 * Valide un format d'adresse email.
 * @param {string} email - L'email à valider.
 * @returns {string | undefined} Un message d'erreur si l'email est invalide.
 */
export const isValidEmail = (email) => {
  if (!email) return undefined;
  const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,4})+$/;
  return emailRegex.test(email)
    ? undefined
    : "Le format de l'adresse email est invalide.";
};

/**
 * Valide la longueur minimale d'une chaîne de caractères.
 * @param {number} min - La longueur minimale.
 * @returns {function(*): (string | undefined)} Une fonction de validation.
 */
export const minLength = (min) => (value) => {
  if (!value) return undefined;
  return String(value).length >= min
    ? undefined
    : `Ce champ doit contenir au moins ${min} caractères.`;
};

/**
 * Valide la force d'un mot de passe de manière détaillée.
 * @param {string} password - Le mot de passe à valider.
 * @returns {string | undefined} Un message d'erreur si le mot de passe n'est pas assez fort.
 */
export const isStrongPassword = (password) => {
  if (!password) return undefined;
  if (password.length < 8) return 'Doit contenir au moins 8 caractères.';
  if (!/[A-Z]/.test(password)) return 'Doit contenir au moins une majuscule.';
  if (!/[a-z]/.test(password)) return 'Doit contenir au moins une minuscule.';
  if (!/[0-9]/.test(password)) return 'Doit contenir au moins un chiffre.';
  if (!/[!@#$%^&*]/.test(password)) return 'Doit contenir au moins un caractère spécial (!@#$%^&*).';
  return undefined;
};

/**
 * Valide un numéro de téléphone sénégalais.
 * @param {string} phone - Le numéro à valider.
 * @returns {string | undefined} Un message d'erreur si invalide.
 */
export const isValidSenegalPhone = (phone) => {
  if (!phone) return undefined;
  const phoneStr = String(phone).replace(/\s+/g, '');
  const validPrefixes = ['77', '78', '76', '70', '75'];
  const phoneRegex = new RegExp(`^(${validPrefixes.join('|')})\\d{7}$`);

  return phoneRegex.test(phoneStr)
    ? undefined
    : 'Doit être un numéro sénégalais valide (ex: 771234567).';
};

/**
 * Vérifie si une valeur est un nombre positif.
 * @param {*} value - La valeur à vérifier.
 * @returns {string | undefined} Un message d'erreur si invalide.
 */
export const isPositiveNumber = (value) => {
    if (value === null || value === undefined || value === '') return undefined;
    const num = Number(String(value).replace(',', '.'));
    return !isNaN(num) && num > 0
        ? undefined
        : 'La valeur doit être un nombre supérieur à zéro.'
}

/**
 * Compose plusieurs fonctions de validation en une seule.
 * @param  {...function} validators - Les fonctions de validation à composer.
 * @returns {function(*): (string | undefined)} Une unique fonction de validation.
 */
export const composeValidators = (...validators) => (value) => {
  for (const validator of validators) {
    const error = validator(value);
    if (error) return error;
  }
  return undefined;
};