// ==============================================================================
//           Composant Bouton de Bascule du Thème (Clair/Sombre)
//
// Ce composant simple et réutilisable permet à l'utilisateur de basculer
// entre le thème clair et le thème sombre de l'application.
//
// Il utilise le hook `useTheme` pour accéder à l'état du thème et à la
// fonction pour le modifier.
// ==============================================================================

import React from 'react';
import { Button } from 'react-bootstrap';
import { SunFill, MoonStarsFill } from 'react-bootstrap-icons';
import { useTheme } from '../../context/ThemeContext'; // Importe notre hook personnalisé

/**
 * Un bouton qui permet de basculer entre le thème clair et sombre.
 */
const ThemeToggleButton = () => {
  // 1. On consomme le contexte via notre hook
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      variant="outline-secondary"
      onClick={toggleTheme}
      aria-label="Basculer le thème"
      title={theme === 'light' ? 'Passer au thème sombre' : 'Passer au thème clair'}
    >
      {/* 2. On affiche l'icône appropriée en fonction du thème actuel */}
      {theme === 'light' ? <MoonStarsFill /> : <SunFill />}
    </Button>
  );
};

export default ThemeToggleButton;