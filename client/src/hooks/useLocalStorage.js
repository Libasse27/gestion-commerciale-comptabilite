// ==============================================================================
//                  Hook Personnalisé : useLocalStorage
//
// Ce hook se comporte comme `useState`, mais il synchronise automatiquement
// l'état avec le `localStorage` du navigateur.
//
// Avantages :
//   - Persistance des données : l'état survit aux rechargements de la page.
//   - Synchronisation entre les onglets : si la valeur change dans un onglet,
//     les autres onglets utilisant le même hook peuvent se mettre à jour.
//   - Simplification du code : abstrait la logique de lecture/écriture
//     et de parsing JSON du localStorage.
// ==============================================================================

import { useState, useEffect } from 'react';

/**
 * Un hook qui se comporte comme useState mais persiste l'état dans le localStorage.
 *
 * @param {string} key - La clé à utiliser dans le localStorage.
 * @param {*} initialValue - La valeur initiale à utiliser si rien n'est trouvé dans le localStorage.
 * @returns {[*, function]} Un tableau contenant la valeur de l'état et la fonction pour la mettre à jour.
 */
function useLocalStorage(key, initialValue) {
  // 1. Initialiser l'état en essayant de lire la valeur depuis le localStorage.
  // La fonction passée à useState ne s'exécute qu'au premier rendu, ce qui est optimal.
  const [storedValue, setStoredValue] = useState(() => {
    // Vérifier si le code s'exécute côté client (localStorage n'existe pas côté serveur pour le SSR)
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Parser le JSON stocké ou retourner la valeur initiale si rien n'est trouvé.
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // En cas d'erreur de parsing, retourner la valeur initiale.
      console.error(`Erreur lors de la lecture de la clé '${key}' depuis le localStorage`, error);
      return initialValue;
    }
  });

  // 2. Créer une version "wrapper" de la fonction `setValue` de `useState`.
  // Cette nouvelle fonction mettra à jour à la fois l'état React ET le localStorage.
  const setValue = (value) => {
    try {
      // Permet à la nouvelle valeur d'être une fonction pour imiter le comportement de setState.
      const valueToStore = value instanceof Function ? value(storedValue) : value;

      // Mettre à jour l'état React
      setStoredValue(valueToStore);

      // Mettre à jour le localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de la clé '${key}' dans le localStorage`, error);
    }
  };

  // Optionnel : écouter les changements dans d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error('Erreur lors de la mise à jour depuis un autre onglet', error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);


  return [storedValue, setValue];
}

export default useLocalStorage;