// ==============================================================================
//                  Hook Personnalisé : useDebounce
//
// Ce hook prend une valeur qui change rapidement (comme le texte d'un champ
// de recherche) et ne retourne cette valeur qu'après qu'un certain temps
// s'est écoulé sans qu'elle n'ait changé.
//
// C'est une technique d'optimisation essentielle pour des fonctionnalités
// comme la recherche en direct, afin de ne pas surcharger le serveur avec
// une requête à chaque frappe de l'utilisateur.
// ==============================================================================

import { useState, useEffect } from 'react';

/**
 * Hook personnalisé pour "débattre" (debounce) une valeur.
 *
 * @param {*} value - La valeur à débattre (ex: le terme de recherche d'un input).
 * @param {number} delay - Le délai en millisecondes à attendre avant de mettre à jour la valeur.
 * @returns {*} La valeur débattue (qui ne se met à jour qu'après le délai d'inactivité).
 */
function useDebounce(value, delay) {
  // 1. État pour stocker la valeur débattue
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(
    () => {
      // 2. Mettre en place un timer.
      // Chaque fois que la `value` (du parent) change, ce `useEffect` se redéclenche.
      const handler = setTimeout(() => {
        // Après `delay` millisecondes, on met à jour notre état local avec la dernière valeur.
        setDebouncedValue(value);
      }, delay);

      // 3. Fonction de nettoyage.
      // Cette fonction est cruciale. Elle est appelée chaque fois que la `value` change
      // (avant que le nouvel effet ne soit exécuté) ou lorsque le composant est démonté.
      // Elle annule le timer précédent, s'assurant que la mise à jour n'aura lieu
      // que pour le tout dernier changement.
      return () => {
        clearTimeout(handler);
      };
    },
    [value, delay] // Le `useEffect` ne s'exécute à nouveau que si `value` ou `delay` change.
  );

  // 4. Retourner la valeur débattue au composant qui utilise le hook.
  return debouncedValue;
}

export default useDebounce;