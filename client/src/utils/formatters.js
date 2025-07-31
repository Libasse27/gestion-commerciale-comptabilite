// ==============================================================================
//                  Fonctions de Formatage des Données (Client)
//
// Ce fichier contient des fonctions dédiées à la transformation de données brutes
// en chaînes de caractères formatées pour l'affichage dans l'interface utilisateur.
//
// Il garantit la cohérence de la présentation des dates, devises, nombres, etc.,
// à travers toute l'application, en respectant les conventions locales.
// ==============================================================================

import { formatCurrency as formatCurrencyGeneric } from './currencyUtils';
import { customFormat, parseDateString } from './dateUtils';
import { ensureNumber } from './numberUtils';

/**
 * Formate un montant numérique en devise XOF (Franc CFA).
 * C'est un alias spécifique pour plus de clarté dans le code.
 * @param {number | string | null | undefined} amount - Le montant à formater.
 * @returns {string} Le montant formaté (ex: "1 234 567 FCFA").
 */
export const formatCurrency = (amount) => {
  return formatCurrencyGeneric(amount, 'XOF');
};

/**
 * Formate une date (objet Date ou chaîne ISO) au format français court (JJ/MM/AAAA).
 * @param {Date | string | null | undefined} dateInput - La date à formater.
 * @returns {string} La date formatée, ou une chaîne vide si l'entrée est invalide.
 */
export const formatDate = (dateInput) => {
  return customFormat(dateInput, 'P'); // 'P' est le format de date localisé (dd/MM/yyyy)
};

/**
 * Formate une date pour un affichage plus lisible et complet (ex: "21 mai 2024").
 * @param {Date | string | null | undefined} dateInput - La date à formater.
 * @returns {string} La date formatée.
 */
export const formatReadableDate = (dateInput) => {
  return customFormat(dateInput, 'dd MMMM yyyy');
};

/**
 * Formate une date et une heure (ex: "21/05/2024 à 14:30").
 * @param {Date | string | null | undefined} dateInput - La date à formater.
 * @returns {string} La date et l'heure formatées.
 */
export const formatDateTime = (dateInput) => {
  return customFormat(dateInput, "P 'à' HH:mm");
};

/**
 * Formate un nombre en pourcentage, en le multipliant d'abord par 100 s'il est une fraction.
 * @param {number} value - La valeur numérique (ex: 85 ou 0.85).
 * @param {number} [decimalPlaces=0] - Le nombre de décimales.
 * @returns {string} La chaîne de caractères formatée (ex: "85 %").
 */
export const formatPercentage = (value, decimalPlaces = 0) => {
  const number = ensureNumber(value);
  
  // Si la valeur est entre 0 et 1, on suppose que c'est une fraction (ex: 0.85 -> 85%)
  const valueToFormat = number <= 1 && number >= 0 ? number : number / 100;

  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(valueToFormat);
};

/**
 * Tronque une chaîne de caractères à une longueur maximale et ajoute "...".
 * @param {string} str - La chaîne à tronquer.
 * @param {number} maxLength - La longueur maximale autorisée.
 * @returns {string} La chaîne tronquée ou l'originale si elle est plus courte.
 */
export const truncate = (str, maxLength) => {
    if (typeof str !== 'string' || str.length <= maxLength) {
        return str;
    }
    return `${str.substring(0, maxLength)}...`;
};

/**
 * Formate un statut (chaîne de caractères) en un format lisible.
 * @param {string} status - Le statut brut (ex: 'partiellement_payee').
 * @returns {string} Le statut formaté (ex: 'Partiellement Payée').
 */
export const formatStatus = (status) => {
    if (typeof status !== 'string') return '';
    return status
        .replace(/_/g, ' ') // Remplace les underscores par des espaces
        .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()); // Met en majuscule chaque mot
}