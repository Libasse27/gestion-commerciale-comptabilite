// client/src/components/common/ThemeToggleButton.jsx
// ============================================================================
// Bouton pour basculer entre les thèmes clair et sombre
// Utilise le hook personnalisé `useTheme` pour détecter l'état et basculer.
// ============================================================================

import React from 'react';
import { Button } from 'react-bootstrap';
import { SunFill, MoonStarsFill } from 'react-bootstrap-icons';
import { useTheme } from '../../context/ThemeContext';

const ThemeToggleButton = () => {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === 'light';

  return (
    <Button
      variant="outline-secondary"
      onClick={toggleTheme}
      className="border-0 rounded-circle"
      size="sm"
      aria-label={`Passer au thème ${isLight ? 'sombre' : 'clair'}`}
      title={`Activer le thème ${isLight ? 'sombre' : 'clair'}`}
      aria-pressed={!isLight}
      autoComplete="off" // Pour éviter les soucis d'autofill
    >
      {isLight ? <MoonStarsFill size={18} /> : <SunFill size={18} />}
    </Button>
  );
};

export default ThemeToggleButton;
