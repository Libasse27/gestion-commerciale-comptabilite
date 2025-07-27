// ==============================================================================
//                  Fonctions d'Aide Utilitaires et Génériques (Client)
//
// Ce fichier contient une collection de fonctions utilitaires pures et
// réutilisables pour le côté client de l'application.
//
// Leur but est de simplifier les tâches répétitives dans les composants
// et les services, et de garder le code plus lisible et DRY.
// ==============================================================================

/**
 * Génère une chaîne de classes CSS conditionnellement.
 * Très utile pour appliquer des styles dynamiques dans les composants.
 * @param {object} classes - Un objet où les clés sont les noms de classe et les valeurs des booléens.
 * @returns {string} Une chaîne contenant les classes dont la valeur était `true`.
 *
 * @example
 * // returns "btn btn-primary active"
 * clsx({ btn: true, 'btn-primary': true, 'btn-lg': false, active: true })
 */
export const clsx = (classes) => {
  return Object.entries(classes)
    .filter(([value]) => value)
    .map(([key]) => key)
    .join(' ');
};

/**
 * Récupère un item du localStorage et le parse en JSON.
 * Gère les erreurs si l'item n'existe pas ou si le JSON est invalide.
 * @param {string} key - La clé de l'item à récupérer.
 * @returns {any | null} L'objet parsé, ou null en cas d'erreur.
 */
export const getFromLocalStorage = (key) => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch (error) {
    console.error(`Erreur lors de la lecture de '${key}' dans le localStorage`, error);
    return null;
  }
};

/**
 * Sauvegarde un item dans le localStorage en le convertissant en chaîne JSON.
 * @param {string} key - La clé sous laquelle sauvegarder l'item.
 * @param {any} value - La valeur à sauvegarder.
 */
export const saveToLocalStorage = (key, value) => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de '${key}' dans le localStorage`, error);
  }
};

/**
 * Gère les erreurs provenant d'Axios pour extraire un message lisible.
 * @param {Error} error - L'objet d'erreur (souvent d'Axios).
 * @returns {string} Un message d'erreur clair pour l'utilisateur.
 */
export const getErrorMessage = (error) => {
  if (error.response && error.response.data && error.response.data.message) {
    // Erreur venant de notre API backend (formatée par notre errorHandler)
    return error.response.data.message;
  }
  if (error.message) {
    // Erreur réseau ou autre erreur JavaScript
    return error.message;
  }
  // Cas par défaut
  return 'Une erreur inattendue est survenue. Veuillez réessayer.';
};

/**
 * Crée une promesse qui se résout après un certain délai.
 * Utile pour simuler des temps de chargement en développement.
 * @param {number} ms - Le délai en millisecondes.
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));