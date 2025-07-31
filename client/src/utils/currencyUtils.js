// ==============================================================================
//                  Utilitaire de Manipulation des Devises (Client)
//
// Ce fichier centralise toutes les fonctions liées à la manipulation et au
// formatage des montants monétaires.
//
// Il garantit que tous les montants affichés dans l'application sont
// cohérents, lisibles et respectent les conventions de la devise cible
// (principalement le Franc CFA - XOF).
// ==============================================================================

// On dépend de notre numberUtils pour parser les nombres de manière robuste
import { ensureNumber } from './numberUtils';

/**
 * Objet de configuration pour les devises supportées.
 * Peut être étendu pour gérer plusieurs devises.
 */
const CURRENCY_CONFIG = Object.freeze({
  XOF: {
    code: 'XOF',
    symbol: 'FCFA',
    locale: 'fr-SN', // Locale spécifique pour le Sénégal
    decimalDigits: 0, // Le Franc CFA n'a généralement pas de centimes
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'fr-FR',
    decimalDigits: 2,
  },
  // ... ajouter d'autres devises si nécessaire
});

/**
 * Formate un montant numérique dans une devise spécifique.
 * C'est la fonction principale de ce module.
 * @param {number | string | null | undefined} amount - Le montant à formater.
 * @param {string} [currencyCode='XOF'] - Le code de la devise (ex: 'XOF', 'EUR').
 * @returns {string} Le montant joliment formaté.
 *
 * @example
 * formatCurrency(1234567) // "1 234 567 FCFA"
 * formatCurrency(999.75, 'EUR') // "999,75 €"
 */
export const formatCurrency = (amount, currencyCode = 'XOF') => {
  const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.XOF;
  const number = ensureNumber(amount, 0);

  try {
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.code,
      minimumFractionDigits: config.decimalDigits,
      maximumFractionDigits: config.decimalDigits,
      currencyDisplay: 'code', // Préférer 'FCFA' à 'F CFA'
    }).format(number);
  } catch (error) {
    console.error(`Erreur lors du formatage de la devise ${currencyCode}:`, error);
    // Fallback simple en cas d'erreur
    return `${number} ${config.symbol}`;
  }
};

/**
 * Convertit un montant formaté (chaîne de caractères) en une valeur numérique.
 * Utile pour parser les entrées utilisateur dans les formulaires.
 * @param {string} formattedAmount - La chaîne de caractères à parser (ex: "1.234,56 €" ou "1 234 567 FCFA").
 * @returns {number} La valeur numérique.
 *
 * @example
 * parseCurrency("1 234 567 FCFA") // 1234567
 */
export const parseCurrency = (formattedAmount) => {
  if (typeof formattedAmount !== 'string') {
    return ensureNumber(formattedAmount, 0);
  }

  // Expression régulière pour extraire uniquement les chiffres et le séparateur décimal (virgule ou point)
  const numericString = formattedAmount
    .replace(/[^0-9,.-]+/g, "") // Supprime tout sauf les chiffres, virgules, points, tirets
    .replace(',', '.'); // Remplace la virgule décimale par un point
  
  return ensureNumber(parseFloat(numericString), 0);
};

/**
 * Formate un montant pour un champ de saisie (input), sans le symbole de la devise.
 * @param {number | string} amount - Le montant.
 * @param {string} [currencyCode='XOF'] - Le code de la devise pour déterminer le nombre de décimales.
 * @returns {string}
 *
 * @example
 * formatForInput(1234, 'XOF') // "1234"
 * formatForInput(1234.56, 'EUR') // "1234.56"
 */
export const formatForInput = (amount, currencyCode = 'XOF') => {
    const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.XOF;
    const number = ensureNumber(amount, 0);
    return number.toFixed(config.decimalDigits);
};