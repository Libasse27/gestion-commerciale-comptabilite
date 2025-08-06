// client/src/context/ThemeContext.jsx
// ==============================================================================
//           Contexte React pour la Gestion du Thème (Clair/Sombre)
// ==============================================================================
import React, { createContext, useContext, useEffect, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

const ThemeContext = createContext(null);

const getInitialTheme = () => {
  if (typeof window === 'undefined') return 'light';

  const savedTheme = window.localStorage.getItem(LOCAL_STORAGE_KEYS.UI_THEME);
  if (savedTheme === 'light' || savedTheme === 'dark') {
    // Le JSON.parse peut échouer si la valeur n'est pas une chaîne JSON valide.
    // Il faut gérer le cas où la valeur est directement 'light' ou 'dark' sans guillemets.
    try {
      const parsedTheme = JSON.parse(savedTheme);
      if (['light', 'dark'].includes(parsedTheme)) return parsedTheme;
    } catch {
        // Ignorer l'erreur si le parsing échoue et continuer.
    }
  }

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useLocalStorage(LOCAL_STORAGE_KEYS.UI_THEME, getInitialTheme);

  useEffect(() => {
    const root = window.document.documentElement;
    root.setAttribute('data-bs-theme', theme); // Pour Bootstrap 5.3+
    root.setAttribute('data-theme', theme); // Pour nos styles custom
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

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === null) {
    throw new Error("useTheme doit être utilisé à l'intérieur d'un ThemeProvider");
  }
  return context;
};