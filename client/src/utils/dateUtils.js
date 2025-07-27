// ==============================================================================
//                  Utilitaire de Manipulation des Dates (Client)
//
// Ce module contient des fonctions d'aide pour toutes les opérations liées
// aux dates dans l'interface utilisateur. Il utilise `date-fns` pour des
// manipulations fiables.
//
// Fonctions incluses :
// - Calculer un âge ou un délai.
// - Formater une durée de manière lisible (ex: "il y a 2 heures").
// - Comparer des dates.
// ==============================================================================

import {
  format,
  formatDistanceToNow,
  parseISO,
  differenceInDays,
  isBefore,
  isAfter,
  isValid,
} from 'date-fns';
import { fr } from 'date-fns/locale'; // Importe la locale française pour les formats lisibles

/**
 * Formate une date de manière relative par rapport à maintenant.
 * @param {Date | string} date - La date à formater.
 * @returns {string} Une chaîne de caractères lisible (ex: "il y a environ 2 heures").
 *
 * @example
 * formatToNow(subHours(new Date(), 2)) // "il y a environ 2 heures"
 */
export const formatToNow = (date) => {
  if (!date || !isValid(new Date(date))) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
};

/**
 * Calcule la différence en jours entre aujourd'hui et une date future.
 * @param {Date | string} dueDate - La date d'échéance.
 * @returns {number | null} Le nombre de jours restants (négatif si la date est passée).
 */
export const daysUntil = (dueDate) => {
  if (!dueDate || !isValid(new Date(dueDate))) return null;
  return differenceInDays(new Date(dueDate), new Date());
};

/**
 * Vérifie si une date est dans le passé.
 * @param {Date | string} date - La date à vérifier.
 * @returns {boolean}
 */
export const isPastDate = (date) => {
  if (!date || !isValid(new Date(date))) return false;
  return isBefore(new Date(date), new Date());
};

/**
 * Vérifie si une date est dans le futur.
 * @param {Date | string} date - La date à vérifier.
 * @returns {boolean}
 */
export const isFutureDate = (date) => {
  if (!date || !isValid(new Date(date))) return false;
  return isAfter(new Date(date), new Date());
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
 * Formate une date selon un format personnalisé.
 * Voir la documentation de date-fns pour tous les formats disponibles.
 * @param {Date | string} date - La date à formater.
 * @param {string} [formatString='P'] - La chaîne de formatage (P = format de date local, ex: 21/05/2024).
 * @returns {string} La date formatée.
 *
 * @example
 * customFormat(new Date(), 'dd MMMM yyyy') // "21 mai 2024"
 * customFormat(new Date(), 'P p') // "21/05/2024, 15:30"
 */
export const customFormat = (date, formatString = 'P') => {
    if (!date || !isValid(new Date(date))) return '';
    return format(new Date(date), formatString, { locale: fr });
}