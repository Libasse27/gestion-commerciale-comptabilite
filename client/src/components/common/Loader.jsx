// ==============================================================================
//                Composant Indicateur de Chargement (Loader)
//
// Ce composant réutilisable affiche un indicateur de chargement ("spinner").
// Il est conçu pour être flexible et peut être affiché de plusieurs manières :
//   - En tant que petit spinner "inline" pour le chargement de boutons ou de petites sections.
//   - En tant que spinner centré pour le chargement d'une page entière ou d'un grand composant.
//   - Avec un texte personnalisé pour donner plus de contexte à l'utilisateur.
//
// Il utilise le composant `Spinner` de `react-bootstrap`.
// ==============================================================================

import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

/**
 * Affiche un indicateur de chargement (spinner).
 *
 * @param {object} props - Les propriétés du composant.
 * @param {boolean} [props.fullscreen=false] - Si true, le spinner couvrira toute la page avec un fond semi-transparent.
 * @param {boolean} [props.centered=false] - Si true, le spinner sera centré dans son conteneur parent.
 * @param {string} [props.variant='primary'] - La couleur du spinner (primary, secondary, success, etc.).
 * @param {string} [props.size='md'] - La taille du spinner ('sm' ou 'md').
 * @param {string} [props.text='Chargement...'] - Le texte à afficher à côté du spinner.
 * @param {boolean} [props.showText=true] - Si true, affiche le texte.
 */
const Loader = ({
  fullscreen = false,
  centered = false,
  variant = 'primary',
  size = 'md',
  text = 'Chargement...',
  showText = true,
}) => {

  const spinner = (
    <div className="d-flex align-items-center">
      <Spinner
        animation="border"
        variant={variant}
        role="status"
        size={size === 'sm' ? 'sm' : undefined} // `size` prop n'existe que pour `sm`
        style={size !== 'sm' ? { width: '2rem', height: '2rem' } : {}}
      >
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {showText && <span className="ms-2">{text}</span>}
    </div>
  );

  // --- Variante 1: Loader en plein écran ---
  // Idéal pour le chargement initial de l'application ou lors d'une action bloquante.
  if (fullscreen) {
    return (
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(255, 255, 255, 0.7)',
          zIndex: 9999,
        }}
      >
        {spinner}
      </div>
    );
  }

  // --- Variante 2: Loader centré dans son conteneur ---
  // Utile pour le chargement d'une carte (Card) ou d'un tableau.
  if (centered) {
    return (
      <div className="d-flex justify-content-center align-items-center w-100 h-100 my-5">
        {spinner}
      </div>
    );
  }

  // --- Variante 3: Loader "inline" (par défaut) ---
  // Parfait pour être placé à l'intérieur d'un bouton.
  return spinner;
};

export default Loader;