// client/src/utils/dateUtils.js
// ==============================================================================
//                  Utilitaire de Manipulation des Dates (Client)
// ==============================================================================

import {
  format,
  formatDistanceToNowStrict,
  parseISO,
  differenceInDays,
  isBefore,
  isAfter,
  isValid,
  startOfToday,
} from 'date-fns';
import { fr } from 'date-fns/locale';

/**
 * Formate une date de manière relative par rapport à maintenant.
 * @param {Date | string | null | undefined} date - La date à formater.
 * @returns {string} Une chaîne lisible (ex: "il y a 2 heures").
 */
export const formatToNow = (date) => {
  if (!date) return '';
  const d = date instanceof Date ? date : parseISO(date);
  if (!isValid(d)) return '';
  return formatDistanceToNowStrict(d, { addSuffix: true, locale: fr });
};

/**
 * Calcule la différence en jours entre aujourd'hui et une date future.
 * @param {Date | string | null | undefined} dueDate - La date d'échéance.
 * @returns {number | null} Le nombre de jours restants (négatif si la date est passée).
 */
export const daysUntil = (dueDate) => {
  if (!dueDate) return null;
  const d = dueDate instanceof Date ? dueDate : parseISO(dueDate);
  if (!isValid(d)) return null;
  return differenceInDays(d, startOfToday());
};

/**
 * Vérifie si une date est dans le passé.
 * @param {Date | string | null | undefined} date - La date à vérifier.
 * @returns {boolean}
 */
export const isPastDate = (date) => {
  if (!date) return false;
  const d = date instanceof Date ? date : parseISO(date);
  if (!isValid(d)) return false;
  return isBefore(d, new Date());
};

/**
 * Vérifie si une date est dans le futur.
 * @param {Date | string | null | undefined} date - La date à vérifier.
 * @returns {boolean}
 */
export const isFutureDate = (date) => {
  if (!date) return false;
  const d = date instanceof Date ? date : parseISO(date);
  if (!isValid(d)) return false;
  return isAfter(d, new Date());
};

/**
 * Formate une date selon un format personnalisé, en utilisant la locale française.
 * @param {Date | string | null | undefined} date - La date à formater.
 * @param {string} [formatString='P'] - La chaîne de formatage (P = 21/05/2024).
 * @returns {string} La date formatée.
 */
export const customFormat = (date, formatString = 'P') => {
  if (!date) return '';
  const d = date instanceof Date ? date : parseISO(date);
  if (!isValid(d)) return '';
  return format(d, formatString, { locale: fr });
};