// ==============================================================================
//                  Fonctions de Formatage des Données (Client)
//
// Ce fichier contient des fonctions dédiées à la transformation de données brutes
// en chaînes de caractères formatées pour l'affichage dans l'interface utilisateur.
//
// Il garantit la cohérence de la présentation des dates, devises, nombres, etc.,
// à travers toute l'application, en respectant les conventions locales.
// ==============================================================================

/**
 * Formate un montant numérique en devise XOF (Franc CFA).
 * Gère les cas où l'entrée n'est pas un nombre.
 * @param {number | string | null | undefined} amount - Le montant à formater.
 * @returns {string} Le montant formaté (ex: "1 234 567 F CFA").
 */
export const formatCurrency = (amount) => {
  const number = Number(amount);
  if (isNaN(number)) {
    return '0 F CFA';
  }
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    currencyDisplay: 'symbol', // Utilise "F CFA" au lieu de "XOF"
  }).format(number);
};


/**
 * Formate une date (objet Date ou chaîne de caractères ISO) au format français court (JJ/MM/AAAA).
 * @param {Date | string | null | undefined} dateInput - La date à formater.
 * @returns {string} La date formatée, ou une chaîne vide si l'entrée est invalide.
 */
export const formatDateFr = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return ''; // Vérifie si la date est valide
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
};

/**
 * Formate une date pour un affichage plus lisible (ex: "20 mai 2024").
 * @param {Date | string | null | undefined} dateInput - La date à formater.
 * @returns {string} La date formatée.
 */
export const formatReadableDate = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  } catch {
    return '';
  }
};


/**
 * Formate une date et une heure (ex: "20/05/2024, 14:30").
 * @param {Date | string | null | undefined} dateInput - La date à formater.
 * @returns {string} La date et l'heure formatées.
 */
export const formatDateTimeFr = (dateInput) => {
  if (!dateInput) return '';
  try {
    const date = new Date(dateInput);
    if (isNaN(date.getTime())) return '';
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch {
    return '';
  }
};

/**
 * Formate un nombre en pourcentage.
 * @param {number} value - La valeur numérique (ex: 0.85).
 * @param {number} [decimalPlaces=2] - Le nombre de décimales.
 * @returns {string} La chaîne de caractères formatée (ex: "85,00 %").
 */
export const formatPercentage = (value, decimalPlaces = 2) => {
  const number = Number(value);
  if (isNaN(number)) return '0 %';
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(number);
};

/**
 * Tronque une chaîne de caractères à une longueur maximale et ajoute "...".
 * @param {string} str - La chaîne à tronquer.
 * @param {number} maxLength - La longueur maximale autorisée.
 * @returns {string} La chaîne tronquée.
 */
export const truncate = (str, maxLength) => {
    if (typeof str !== 'string' || str.length <= maxLength) {
        return str;
    }
    return `${str.substring(0, maxLength)}...`;
}