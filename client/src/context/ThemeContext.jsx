// ==============================================================================
//           Contexte React pour la Gestion du Thème (Clair/Sombre)
//
// Ce module fournit un Contexte et un Provider pour gérer le thème de l'interface
// utilisateur de manière globale dans toute l'application.
// Il gère la persistance du choix de l'utilisateur et détecte les préférences
// du système pour le premier chargement.
// ==============================================================================
import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

// 1. Création du Contexte
// La valeur par défaut `null` sera surchargée par le Provider.
const ThemeContext = createContext(null);

/**
 * Fonction d'aide pour déterminer le thème initial au premier chargement.
 * Elle est conçue pour ne s'exécuter qu'une seule fois.
 */
const getInitialTheme = () => {
  // Si le code s'exécute côté serveur (SSR), on retourne une valeur par défaut.
  if (typeof window === 'undefined') {
    return 'light';
  }

  // Priorité 1 : Vérifier s'il y a un thème déjà sauvegardé par l'utilisateur.
  const savedTheme = window.localStorage.getItem(LOCAL_STORAGE_KEYS.UI_THEME);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    return savedTheme;
  }

  // Priorité 2 : Vérifier les préférences du système d'exploitation / navigateur.
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  // Priorité 3 : Thème par défaut.
  return 'light';
};

/**
 * Le Provider (fournisseur) qui va envelopper notre application pour donner
 * accès au contexte du thème à tous ses enfants.
 * @param {{children: React.ReactNode}} props
 */
export const ThemeProvider = ({ children }) => {
  // On utilise notre hook `useLocalStorage` avec la fonction d'initialisation lazy.
  const [theme, setTheme] = useLocalStorage(LOCAL_STORAGE_KEYS.UI_THEME, getInitialTheme);

  // Applique le thème au document à chaque changement de la variable `theme`.
  useEffect(() => {
    const root = window.document.documentElement;
    
    // On met à jour l'attribut `data-theme` qui contrôle nos variables CSS.
    root.setAttribute('data-theme', theme);
  }, [theme]);

  // `useCallback` mémorise la fonction `toggleTheme` pour qu'elle ne soit
  // pas recréée à chaque re-render, ce qui optimise les performances.
  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

  // `useMemo` mémorise l'objet `value` du contexte. Les composants qui
  // consomment ce contexte ne se re-rendront que si `theme` ou `toggleTheme`
  // changent réellement.
  const value = useMemo(() => ({
    theme,
    toggleTheme,
  }), [theme, toggleTheme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

/**
 * Hook personnalisé pour consommer facilement le Contexte du Thème.
 * @returns {{theme: ('light' | 'dark'), toggleTheme: function}}
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
  }
  return context;
};