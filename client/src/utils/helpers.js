// client/src/utils/helpers.js
// ==============================================================================
//                  Fonctions d'Aide Utilitaires et Génériques (Client)
// ==============================================================================

export function clsx(...args) {
  // ... (fonction clsx complète et robuste)
  let classes = [];
  for (const arg of args) {
    if (!arg) continue;
    const argType = typeof arg;
    if (argType === 'string' || argType === 'number') {
      classes.push(arg);
    } else if (Array.isArray(arg) && arg.length) {
      const inner = clsx(...arg);
      if (inner) classes.push(inner);
    } else if (argType === 'object') {
      for (const key in arg) {
        if (Object.prototype.hasOwnProperty.call(arg, key) && arg[key]) {
          classes.push(key);
        }
      }
    }
  }
  return classes.join(' ');
}


/**
 * Récupère un item du localStorage de manière sécurisée.
 */
export const getFromLocalStorage = (key) => {
  if (typeof window === 'undefined') return null;
  try {
    const item = window.localStorage.getItem(key);
    // Gère le cas où la clé n'existe pas ou si la valeur est "undefined"
    if (item === null || item === 'undefined') {
        return null;
    }
    return JSON.parse(item);
  } catch (error) {
    console.error(`Erreur lors de la lecture de '${key}' depuis le localStorage`, error);
    return null;
  }
};


/**
 * Sauvegarde un item dans le localStorage de manière sécurisée.
 */
export const saveToLocalStorage = (key, value) => {
  if (typeof window === 'undefined') return;
  try {
    // Si la valeur est undefined, on supprime la clé pour éviter de stocker la chaîne "undefined"
    if (value === undefined) {
      window.localStorage.removeItem(key);
    } else {
      const serializedValue = JSON.stringify(value);
      window.localStorage.setItem(key, serializedValue);
    }
  } catch (error) {
    console.error(`Erreur lors de la sauvegarde de '${key}' dans le localStorage`, error);
  }
};


/**
 * Supprime un item du localStorage.
 */
export const removeFromLocalStorage = (key) => {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.removeItem(key);
    } catch (error) {
        console.error(`Erreur lors de la suppression de '${key}' dans le localStorage`, error);
    }
}


/**
 * Gère les erreurs provenant d'Axios pour extraire un message lisible.
 */
export const getErrorMessage = (error) => {
  let message = 'Une erreur inattendue est survenue.';
  if (error?.response?.data?.message) {
    message = error.response.data.message;
  } else if (error?.message) {
    message = error.message;
  }
  return message;
};


/**
 * Crée une promesse qui se résout après un certain délai.
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));