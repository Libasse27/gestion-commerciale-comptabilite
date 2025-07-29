// ==============================================================================
//           Contexte React pour la Gestion du Thème (Clair/Sombre)
//
//                 *** VERSION DE DÉBOGAGE SIMPLIFIÉE ***
//
// La logique complexe a été retirée pour isoler la source de l'erreur 500 de Vite.
// ==============================================================================

import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

// 1. Création du Contexte
const ThemeContext = createContext(null);

/**
 * Le Provider (fournisseur) qui va envelopper notre application.
 */
export const ThemeProvider = ({ children }) => {
  // On utilise une valeur initiale simple ('light') pour éviter les appels à `window`
  // lors de la phase d'analyse de Vite.
  const [theme, setTheme] = useLocalStorage(LOCAL_STORAGE_KEYS.UI_THEME, 'light');

  // Applique le thème au document à chaque changement
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(theme);
    root.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  }, [setTheme]);

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
 */
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
};