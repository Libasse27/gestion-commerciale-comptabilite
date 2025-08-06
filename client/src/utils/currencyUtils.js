// client/src/utils/currencyUtils.js
// ==============================================================================
//                  Utilitaire de Manipulation des Devises (Client)
// ==============================================================================

import { ensureNumber } from './numberUtils';

const CURRENCY_CONFIG = Object.freeze({
  XOF: {
    code: 'XOF',
    symbol: 'FCFA',
    locale: 'fr-SN',
    decimalDigits: 0,
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    locale: 'fr-FR',
    decimalDigits: 2,
  },
});

/**
 * Formate un montant numérique dans une devise spécifique.
 * @param {number | string | null | undefined} amount - Le montant à formater.
 * @param {string} [currencyCode='XOF'] - Le code de la devise.
 * @returns {string} Le montant joliment formaté.
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
    }).format(number);
  } catch (error) {
    console.error(`Erreur lors du formatage de la devise ${currencyCode}:`, error);
    return `${number} ${config.symbol}`;
  }
};

/**
 * Convertit un montant formaté (chaîne de caractères) en une valeur numérique.
 * @param {string | number} formattedAmount - La chaîne de caractères à parser.
 * @returns {number} La valeur numérique.
 */
export const parseCurrency = (formattedAmount) => {
  if (typeof formattedAmount !== 'string') {
    return ensureNumber(formattedAmount, 0);
  }

  const numericString = formattedAmount
    .replace(/[^\d,.-]/g, "") // Supprime tout sauf les chiffres, virgules, points, tirets
    .replace(',', '.');
  
  return ensureNumber(parseFloat(numericString), 0);
};

/**
 * Formate un montant pour un champ de saisie (input), sans le symbole de la devise.
 * @param {number | string} amount - Le montant.
 * @param {string} [currencyCode='XOF'] - Le code de la devise.
 * @returns {string}
 */
export const formatForInput = (amount, currencyCode = 'XOF') => {
    const config = CURRENCY_CONFIG[currencyCode] || CURRENCY_CONFIG.XOF;
    const number = ensureNumber(amount, 0);
    return number.toFixed(config.decimalDigits);
};