// ==============================================================================
//                  Hook Personnalisé : useDebounce
//
// Ce hook retarde la mise à jour d'une valeur jusqu'à ce qu'un certain
// temps se soit écoulé sans qu'elle ait changé.
//
// C'est extrêmement utile pour des fonctionnalités comme les barres de recherche,
// afin de ne déclencher une requête API qu'une fois que l'utilisateur a
// fini de taper, plutôt qu'à chaque frappe.
// ==============================================================================

import { useState, useEffect } from 'react';
import { UI_SETTINGS } from '../utils/constants';

/**
 * Hook personnalisé pour "débattre" (debounce) une valeur.
 *
 * @param {*} value - La valeur à débattre (ex: le terme de recherche d'un input).
 * @param {number} [delay=UI_SETTINGS.DEFAULT_DEBOUNCE_DELAY] - Le délai en millisecondes.
 * @returns {*} La valeur débattue (qui ne se met à jour qu'après le délai).
 */
export function useDebounce(value, delay = UI_SETTINGS.DEFAULT_DEBOUNCE_DELAY) {
  // État interne pour stocker la valeur débattue
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // Met en place un minuteur pour mettre à jour la valeur débattue après le délai
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // Fonction de nettoyage : si la `value` ou le `delay` change avant que le
      // minuteur ne soit terminé, on l'annule. C'est le cœur du mécanisme de debounce.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Ne ré-exécuter l'effet que si la valeur ou le délai change
  );

  return debouncedValue;
}