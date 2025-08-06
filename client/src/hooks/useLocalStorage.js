// client/src/hooks/useLocalStorage.js
// ==============================================================================
//                  Hook Personnalisé : useLocalStorage
//
// Se comporte comme `useState` mais synchronise la valeur avec le localStorage.
// Idéal pour persister des états simples comme les préférences de l'utilisateur.
// ==============================================================================

import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      if (item) return JSON.parse(item);
      
      const initial = initialValue instanceof Function ? initialValue() : initialValue;
      window.localStorage.setItem(key, JSON.stringify(initial));
      return initial;
    } catch (error) {
      console.error(`Erreur lors de la lecture de la clé '${key}' depuis localStorage`, error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Erreur lors de la sauvegarde de la clé '${key}' dans localStorage`, error);
    }
  }, [key, storedValue]);

  // Écoute les changements depuis d'autres onglets
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue !== e.oldValue) {
        try {
          setStoredValue(e.newValue ? JSON.parse(e.newValue) : initialValue);
        } catch (error) {
          console.error(`Erreur lors de la mise à jour de la clé '${key}' depuis l'événement storage`, error);
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