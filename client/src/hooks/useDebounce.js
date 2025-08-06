// client/src/hooks/useDebounce.js
// ==============================================================================
//                  Hook Personnalisé : useDebounce
//
// Retarde la mise à jour d'une valeur jusqu'à ce qu'un certain temps se soit
// écoulé sans qu'elle ait changé. Idéal pour les barres de recherche.
// ==============================================================================

import { useState, useEffect } from 'react';
import { UI_SETTINGS } from '../utils/constants';

/**
 * Hook personnalisé pour "débattre" (debounce) une valeur.
 *
 * @param {*} value - La valeur à débattre.
 * @param {number} [delay] - Le délai en millisecondes.
 * @returns {*} La valeur débattue.
 */
export function useDebounce(value, delay = UI_SETTINGS.DEFAULT_DEBOUNCE_DELAY) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      const handler = setTimeout(() => {
        setDebouncedValue(value);
      }, delay);

      // La fonction de nettoyage annule le minuteur si la `value` change.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay]
  );

  return debouncedValue;
}