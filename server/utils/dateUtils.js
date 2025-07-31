// ==============================================================================
//                  Utilitaire de Manipulation des Dates
//
// Ce module contient des fonctions d'aide pour toutes les opérations liées
// aux dates. Il utilise la bibliothèque `date-fns` pour des manipulations
// fiables, prévisibles et immuables.
//
// Centraliser la logique de date ici permet de gérer facilement les fuseaux
// horaires et les formats à travers toute l'application.
// ==============================================================================

const {
  addDays,
  isBefore,
  isAfter,
  isToday,
  isSameDay,
  differenceInDays,
  startOfDay,
  endOfDay,
  parseISO,
} = require('date-fns');

/**
 * Ajoute un nombre de jours à une date donnée.
 * @param {Date | string | number} date - La date de départ.
 * @param {number} daysToAdd - Le nombre de jours à ajouter.
 * @returns {Date} La nouvelle date.
 */
const addDaysToDate = (date, daysToAdd) => {
  return addDays(new Date(date), daysToAdd);
};

/**
 * Calcule la date d'échéance à partir d'une date de départ et d'un délai.
 * Ex: date de facture + 30 jours.
 * @param {Date} startDate - La date de départ.
 * @param {number} paymentTermsInDays - Le nombre de jours de délai.
 * @returns {Date} La date d'échéance calculée.
 */
const calculateDueDate = (startDate, paymentTermsInDays) => {
  return addDays(startOfDay(new Date(startDate)), paymentTermsInDays);
};

/**
 * Vérifie si une date est dans le passé (avant le début de la journée actuelle).
 * @param {Date | string | number} date - La date à vérifier.
 * @returns {boolean} `true` si la date est passée.
 */
const isDateInPast = (date) => {
  return isBefore(new Date(date), startOfDay(new Date()));
};

/**
 * Vérifie si une date est dans le futur (après la fin de la journée actuelle).
 * @param {Date | string | number} date - La date à vérifier.
 * @returns {boolean} `true` si la date est dans le futur.
 */
const isDateInFuture = (date) => {
  return isAfter(new Date(date), endOfDay(new Date()));
};

/**
 * Calcule la différence en jours entre deux dates.
 * Le résultat est positif si dateLeft est antérieure à dateRight.
 * @param {Date | string | number} dateLeft - La première date.
 * @param {Date | string | number} dateRight - La seconde date.
 * @returns {number} Le nombre de jours de différence.
 */
const getDifferenceInDays = (dateLeft, dateRight) => {
  return differenceInDays(new Date(dateRight), new Date(dateLeft));
};

/**
* Vérifie si une date d'échéance est dépassée.
* @param {Date} dueDate - La date d'échéance.
* @returns {boolean} `true` si la date d'échéance est dépassée.
*/
const isOverdue = (dueDate) => {
  // Une facture est en retard si sa date d'échéance est strictement avant aujourd'hui.
  return isBefore(startOfDay(new Date(dueDate)), startOfDay(new Date()));
};

/**
 * Renvoie le début du jour (00:00:00) pour une date donnée.
 * @param {Date | string | number} date - La date.
 * @returns {Date}
 */
const getStartOfDay = (date) => {
  return startOfDay(new Date(date));
};

/**
 * Renvoie la fin du jour (23:59:59.999) pour une date donnée.
 * @param {Date | string | number} date - La date.
 * @returns {Date}
 */
const getEndOfDay = (date) => {
  return endOfDay(new Date(date));
};


module.exports = {
  addDaysToDate,
  calculateDueDate,
  isDateInPast,
  isDateInFuture,
  isOverdue,
  getDifferenceInDays,
  getStartOfDay,
  getEndOfDay,
  isToday,
  isSameDay,
  parseISO, // Exporte `parseISO` pour convertir une chaîne ISO 8601 en objet Date.
};