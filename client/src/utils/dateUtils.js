// ==============================================================================
//                  Utilitaire de Manipulation des Dates (Client)
//
// Ce module contient des fonctions d'aide pour toutes les opérations liées
// aux dates dans l'interface utilisateur. Il utilise `date-fns` pour des
// manipulations fiables et localisées.
//
// Fonctions incluses :
// - Formater une date de manière lisible (ex: "il y a 2 heures").
// - Comparer des dates.
// - Formater selon des patrons spécifiques.
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
import { fr } from 'date-fns/locale'; // Importe la locale française pour les formats lisibles

/**
 * Formate une date de manière relative par rapport à maintenant.
 * @param {Date | string} date - La date à formater.
 * @returns {string} Une chaîne de caractères lisible (ex: "il y a 2 heures").
 *
 * @example
 * formatToNow(subHours(new Date(), 2)) // "il y a 2 heures"
 */
export const formatToNow = (date) => {
  const d = date instanceof Date ? date : parseISO(date);
  if (!isValid(d)) return '';
  return formatDistanceToNowStrict(d, { addSuffix: true, locale: fr });
};

/**
 * Calcule la différence en jours entre aujourd'hui et une date future.
 * @param {Date | string} dueDate - La date d'échéance.
 * @returns {number | null} Le nombre de jours restants (négatif si la date est passée).
 */
export const daysUntil = (dueDate) => {
  const d = dueDate instanceof Date ? dueDate : parseISO(dueDate);
  if (!isValid(d)) return null;
  return differenceInDays(d, startOfToday());
};

/**
 * Vérifie si une date est dans le passé.
 * @param {Date | string} date - La date à vérifier.
 * @returns {boolean}
 */
export const isPastDate = (date) => {
  const d = date instanceof Date ? date : parseISO(date);
  if (!isValid(d)) return false;
  return isBefore(d, new Date());
};

/**
 * Vérifie si une date est dans le futur.
 * @param {Date | string} date - La date à vérifier.
 * @returns {boolean}
 */
export const isFutureDate = (date) => {
  const d = date instanceof Date ? date : parseISO(date);
  if (!isValid(d)) return false;
  return isAfter(d, new Date());
};

/**
 * Convertit une chaîne de date ISO 8601 en un objet Date JavaScript valide.
 * @param {string} isoString - La chaîne de caractères ISO (ex: "2024-05-21T10:00:00.000Z").
 * @returns {Date | null} Un objet Date ou null si la chaîne est invalide.
 */
export const parseDateString = (isoString) => {
  if (!isoString) return null;
  const date = parseISO(isoString);
  return isValid(date) ? date : null;
};

/**
 * Formate une date selon un format personnalisé, en utilisant la locale française.
 * Voir la documentation de date-fns pour tous les formats disponibles: https://date-fns.org/v2/docs/format
 * @param {Date | string} date - La date à formater.
 * @param {string} [formatString='P'] - La chaîne de formatage (P = format de date local, ex: 21/05/2024).
 * @returns {string} La date formatée.
 *
 * @example
 * customFormat(new Date(), 'dd MMMM yyyy') // "21 mai 2024"
 * customFormat(new Date(), 'P p') // "21/05/2024, 15:30:00"
 */
export const customFormat = (date, formatString = 'P') => {
  const d = date instanceof Date ? date : parseISO(date);
  if (!isValid(d)) return '';
  return format(d, formatString, { locale: fr });
};