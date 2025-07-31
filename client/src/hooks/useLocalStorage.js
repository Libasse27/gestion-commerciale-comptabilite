// ==============================================================================
//                  Hook Personnalisé : useLocalStorage
//
// Ce hook se comporte comme `useState` mais synchronise la valeur avec le
// localStorage du navigateur. Il est idéal pour persister des états simples
// comme les préférences de l'utilisateur (ex: le thème UI).
//
// Caractéristiques :
//   - Persistance des données après rechargement de la page.
//   - Initialisation "lazy" (via une fonction) pour les calculs coûteux.
//   - Synchronisation automatique entre les onglets du navigateur.
// ==============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  // `useState` reçoit une fonction pour l'initialisation "lazy".
  // Cette fonction ne s'exécute qu'une seule fois, au montage du composant.
  const [storedValue, setStoredValue] = useState(() => {
    // Ne pas exécuter côté serveur (pour SSR avec Next.js, etc.)
    if (typeof window === 'undefined') {
      return initialValue instanceof Function ? initialValue() : initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      // Si une valeur existe déjà, on la parse, sinon on utilise la valeur initiale.
      if (item) return JSON.parse(item);
      
      return initialValue instanceof Function ? initialValue() : initialValue;
    } catch (error) {
      console.error(`Erreur lors de la lecture de la clé '${key}' depuis localStorage`, error);
      return initialValue instanceof Function ? initialValue() : initialValue;
    }
  });

  // Wrapper `setValue` pour qu'elle se comporte comme celle de `useState`
  // et mette à jour le localStorage. `useCallback` est utilisé pour la performance.
  const setValue = useCallback((value) => {
    try {
      // Permet de passer une fonction pour mettre à jour l'état (ex: `setCount(c => c + 1)`)
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      // Met à jour l'état React
      setStoredValue(valueToStore);
      // Met à jour le localStorage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de la clé '${key}' dans localStorage`, error);
    }
  }, [key, storedValue]);

  // Écoute les changements dans le localStorage depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== e.oldValue) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error(`Erreur lors de la mise à jour depuis l'événement storage pour la clé '${key}'`, error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Nettoyage de l'écouteur d'événement au démontage du composant
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, initialValue]);


  return [storedValue, setValue];
}