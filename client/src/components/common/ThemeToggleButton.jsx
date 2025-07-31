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
import { Button, Tooltip, OverlayTrigger } from 'react-bootstrap';
import { SunFill, MoonStarsFill } from 'react-bootstrap-icons';
import { useTheme } from '../../context/ThemeContext'; // Importe notre hook personnalisé

/**
 * Un bouton iconique qui permet de basculer entre le thème clair et sombre,
 * avec une infobulle pour l'accessibilité.
 */
const ThemeToggleButton = (props) => {
  // On consomme le contexte du thème via notre hook personnalisé
  const { theme, toggleTheme } = useTheme();

  // Détermine si le thème actuel est 'light'
  const isLight = theme === 'light';

  // Choisit l'icône et le texte de l'infobulle en fonction du thème
  const Icon = isLight ? MoonStarsFill : SunFill;
  const tooltipText = isLight ? 'Passer au thème sombre' : 'Passer au thème clair';

  // Composant Tooltip de React-Bootstrap
  const renderTooltip = (tooltipProps) => (
    <Tooltip id="theme-tooltip" {...tooltipProps}>
      {tooltipText}
    </Tooltip>
  );

  return (
    <OverlayTrigger
      placement="bottom"
      delay={{ show: 250, hide: 400 }}
      overlay={renderTooltip}
    >
      <Button
        variant="outline-secondary"
        onClick={toggleTheme}
        aria-label="Basculer le thème"
        {...props} // Passe toutes les autres props (comme `className`) au composant Button
      >
        <Icon size={18} />
      </Button>
    </OverlayTrigger>
  );
};

export default ThemeToggleButton;