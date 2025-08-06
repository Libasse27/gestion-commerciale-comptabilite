// client/src/utils/formatters.js
// ==============================================================================
//                  Fonctions de Formatage des Données (Client)
// ==============================================================================

import { formatCurrency as formatCurrencyGeneric } from './currencyUtils';
import { customFormat } from './dateUtils';
import { ensureNumber } from './numberUtils';

/**
 * Formate un montant numérique en devise XOF (Franc CFA).
 * @param {number | string | null | undefined} amount - Le montant.
 * @returns {string} Le montant formaté (ex: "1 234 567 FCFA").
 */
export const formatCurrency = (amount) => {
  return formatCurrencyGeneric(amount, 'XOF');
};

/**
 * Formate une date au format français court (JJ/MM/AAAA).
 * @param {Date | string | null | undefined} dateInput - La date.
 * @returns {string} La date formatée.
 */
export const formatDate = (dateInput) => {
  return customFormat(dateInput, 'P');
};

/**
 * Formate une date pour un affichage plus lisible (ex: "21 mai 2024").
 * @param {Date | string | null | undefined} dateInput - La date.
 * @returns {string} La date formatée.
 */
export const formatReadableDate = (dateInput) => {
  return customFormat(dateInput, 'dd MMMM yyyy');
};

/**
 * Formate une date et une heure (ex: "21/05/2024 à 14:30").
 * @param {Date | string | null | undefined} dateInput - La date.
 * @returns {string} La date et l'heure formatées.
 */
export const formatDateTime = (dateInput) => {
  return customFormat(dateInput, "P 'à' HH:mm");
};

/**
 * Formate un nombre en pourcentage.
 * @param {number} value - La valeur numérique.
 * @param {number} [decimalPlaces=0] - Le nombre de décimales.
 * @returns {string} La chaîne formatée (ex: "85 %").
 */
export const formatPercentage = (value, decimalPlaces = 0) => {
  const number = ensureNumber(value);
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(number);
};

/**
 * Tronque une chaîne de caractères à une longueur maximale.
 * @param {string | null | undefined} str - La chaîne.
 * @param {number} [maxLength=50] - La longueur maximale.
 * @returns {string} La chaîne tronquée.
 */
export const truncate = (str, maxLength = 50) => {
    if (typeof str !== 'string' || str.length <= maxLength) {
        return str || '';
    }
    return `${str.substring(0, maxLength)}...`;
};

/**
 * Formate un statut en un format lisible.
 * @param {string | null | undefined} status - Le statut brut.
 * @returns {string} Le statut formaté (ex: 'Partiellement Payée').
 */
export const formatStatus = (status) => {
    if (typeof status !== 'string') return '';
    return status
        .replace(/_/g, ' ')
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
}