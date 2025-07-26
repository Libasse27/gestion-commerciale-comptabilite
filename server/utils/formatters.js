// ==============================================================================
//                  Fonctions de Formatage des Données
//
// Ce fichier contient des fonctions dédiées à la transformation de données brutes
// (dates, nombres, chaînes) en formats spécifiques et standardisés pour
// l'affichage, les logs, ou le stockage.
//
// Le but est de garantir la cohérence de la présentation des données à
// travers toute l'application.
// ==============================================================================

/**
 * Formate un objet Date au format français standard (JJ/MM/AAAA).
 * @param {Date} date - L'objet Date à formater.
 * @returns {string} La date formatée ou une chaîne vide si l'entrée est invalide.
 */
const formatDateFr = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  return new Intl.DateTimeFormat('fr-SN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
};

/**
 * Formate un objet Date pour inclure l'heure (JJ/MM/AAAA HH:mm).
 * @param {Date} date - L'objet Date à formater.
 * @returns {string} La date et l'heure formatées.
 */
const formatDateTimeFr = (date) => {
  if (!(date instanceof Date) || isNaN(date)) {
    return '';
  }
  return new Intl.DateTimeFormat('fr-SN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date);
};

/**
 * Formate un nombre en devise XOF (Franc CFA) avec symbole et séparateurs.
 * Alias de la fonction dans helpers.js pour la centralisation du formatage.
 * @param {number} amount - Le montant à formater.
 * @returns {string} Le montant formaté (ex: "1 234 567 FCFA").
 */
const formatCurrency = (amount) => {
  if (typeof amount !== 'number') return '0 FCFA';
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
  }).format(amount);
};

/**
 * Formate un numéro de téléphone au format sénégalais.
 * Ex: 771234567 -> "+221 77 123 45 67"
 * @param {string | number} phone - Le numéro de téléphone.
 * @returns {string} Le numéro formaté.
 */
const formatPhoneSN = (phone) => {
  if (!phone) return '';
  const phoneStr = phone.toString().replace(/\D/g, ''); // Enlève tout ce qui n'est pas un chiffre
  if (phoneStr.length === 9) { // Format 7X XXX XX XX
    return `+221 ${phoneStr.slice(0, 2)} ${phoneStr.slice(2, 5)} ${phoneStr.slice(5, 7)} ${phoneStr.slice(7, 9)}`;
  }
  if (phoneStr.startsWith('221') && phoneStr.length === 12) { // Format 2217X...
    const localPart = phoneStr.slice(3);
    return `+221 ${localPart.slice(0, 2)} ${localPart.slice(2, 5)} ${localPart.slice(5, 7)} ${localPart.slice(7, 9)}`;
  }
  return phone.toString(); // Retourne l'original si le format est inconnu
};

/**
 * Tronque une chaîne de caractères si elle dépasse une certaine longueur.
 * @param {string} str - La chaîne à tronquer.
 * @param {number} maxLength - La longueur maximale.
 * @returns {string} La chaîne tronquée avec "..."
 */
const truncateString = (str, maxLength) => {
  if (typeof str !== 'string' || str.length <= maxLength) {
    return str;
  }
  return str.slice(0, maxLength) + '...';
};

/**
 * Formate un objet pour l'affichage dans les logs en retirant les champs sensibles.
 * @param {object} obj - L'objet à formater.
 * @returns {string} Une version JSON de l'objet sans les champs sensibles.
 */
const formatObjectForLog = (obj) => {
  if (typeof obj !== 'object' || obj === null) return '';

  const sanitizedObj = { ...obj };
  const sensitiveKeys = ['password', 'token', 'jwt', 'secret', 'authorization', 'apiKey'];

  for (const key in sanitizedObj) {
    if (sensitiveKeys.includes(key.toLowerCase())) {
      sanitizedObj[key] = '***REDACTED***';
    }
  }

  return JSON.stringify(sanitizedObj, null, 2); // Le '2' indente le JSON pour la lisibilité
};


module.exports = {
  formatDateFr,
  formatDateTimeFr,
  formatCurrency,
  formatPhoneSN,
  truncateString,
  formatObjectForLog,
};