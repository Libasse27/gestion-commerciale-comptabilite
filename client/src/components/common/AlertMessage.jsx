// ==============================================================================
//           Composant Réutilisable pour les Messages d'Alerte
//
// Rôle : Affiche un message d'alerte stylisé (succès, erreur, information, etc.)
// en utilisant les classes d'alerte de Bootstrap 5.
//
// Props :
//   - variant (string) : La couleur de l'alerte ('success', 'danger', 'warning', 'info', etc.).
//                        Défaut : 'info'.
//   - title (string)   : Un titre optionnel pour l'alerte, affiché en gras.
//   - children (node)  : Le contenu principal du message d'alerte.
//   - className (string): Classes CSS supplémentaires pour une personnalisation avancée.
//   - onDismiss (func) : Une fonction optionnelle pour rendre l'alerte "dismissible" (fermable).
// ==============================================================================

import React from 'react';
import PropTypes from 'prop-types';
import { Alert } from 'react-bootstrap'; // On utilise le composant Alert de react-bootstrap

/**
 * Affiche un message d'alerte stylisé et potentiellement fermable.
 */
const AlertMessage = ({ variant = 'danger', title, children, className, onDismiss }) => {
  // Si 'children' est vide ou null, on n'affiche rien du tout pour éviter
  // d'avoir une boîte d'alerte vide à l'écran.
  if (!children) {
    return null;
  }
  
  return (
    <Alert 
      variant={variant}
      // Si une fonction `onDismiss` est fournie, l'alerte devient fermable.
      onClose={onDismiss} 
      dismissible={!!onDismiss}
      className={`shadow-sm border-0 ${className}`}
    >
      {/* Affiche le titre uniquement s'il est fourni */}
      {title && <Alert.Heading as="h5">{title}</Alert.Heading>}
      
      {/* Affiche le contenu principal de l'alerte */}
      {children}
    </Alert>
  );
};

// --- Définition des PropTypes pour la validation et la documentation ---
AlertMessage.propTypes = {
  /**
   * La variante de couleur de l'alerte, correspondant aux thèmes Bootstrap.
   */
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark']),
  /**
   * Le titre de l'alerte (optionnel).
   */
  title: PropTypes.string,
  /**
   * Le message ou les éléments React à afficher dans le corps de l'alerte.
   */
  children: PropTypes.node.isRequired,
  /**
   * Classes CSS additionnelles pour le conteneur de l'alerte.
   */
  className: PropTypes.string,
  /**
   * Si cette fonction est fournie, une icône de fermeture sera affichée.
   * La fonction est appelée lorsque l'utilisateur clique sur l'icône.
   */
  onDismiss: PropTypes.func,
};

export default AlertMessage;