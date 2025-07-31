// ==============================================================================
//                  Fonctions de Validation pour Formulaires (Client)
//
// Ce fichier contient des fonctions de validation conçues pour être utilisées
// dans les formulaires côté client (avec des bibliothèques comme Formik,
// React Hook Form, ou des formulaires contrôlés simples).
//
// Leur but est de fournir un retour instantané à l'utilisateur.
// Ces validations sont une première ligne de défense et n'excluent PAS
// les validations robustes qui doivent être effectuées sur le backend.
// ==============================================================================

/**
 * Vérifie si une valeur est vide (chaîne vide, null, undefined).
 * @param {*} value - La valeur à vérifier.
 * @returns {string | undefined} Un message d'erreur si la valeur est vide, sinon undefined.
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
  if (!email) return undefined; // La validation 'isRequired' s'en chargera
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
  return value && value.length >= min
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
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*]/.test(password);

  if (password.length < 8) return 'Doit contenir au moins 8 caractères.';
  if (!hasUpperCase) return 'Doit contenir au moins une majuscule.';
  if (!hasLowerCase) return 'Doit contenir au moins une minuscule.';
  if (!hasNumber) return 'Doit contenir au moins un chiffre.';
  if (!hasSpecialChar) return 'Doit contenir au moins un caractère spécial (!@#$%^&*).';

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
    : 'Doit être un numéro sénégalais valide (ex: 77 123 45 67).';
};

/**
 * Vérifie si une valeur est un nombre positif.
 * @param {*} value - La valeur à vérifier.
 * @returns {string | undefined} Un message d'erreur si invalide.
 */
export const isPositiveNumber = (value) => {
    const num = Number(String(value).replace(',', '.')); // Gère la virgule
    return !isNaN(num) && num > 0
        ? undefined
        : 'La valeur doit être un nombre supérieur à zéro.'
}

/**
 * Compose plusieurs fonctions de validation en une seule.
 * Exécute les validateurs en séquence et retourne le premier message d'erreur trouvé.
 * @param  {...function} validators - Les fonctions de validation à composer.
 * @returns {function(*): (string | undefined)} Une unique fonction de validation.
 */
export const composeValidators = (...validators) => (value) => {
  return validators.reduce((error, validator) => error || validator(value), undefined);
};