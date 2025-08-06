// client/src/components/common/Loader.jsx
// ==============================================================================
//                Composant Indicateur de Chargement (Loader)
// ==============================================================================

import React from 'react';
import { Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';

/**
 * Affiche un indicateur de chargement (spinner) flexible.
 */
const Loader = ({
  fullscreen = false,
  centered = false,
  variant = 'primary',
  size = 'md',
  text = 'Chargement...',
  showText = false,
}) => {

  const spinnerComponent = (
    <div className="d-flex align-items-center">
      <Spinner
        animation="border"
        variant={variant}
        role="status"
        size={size === 'sm' ? 'sm' : undefined}
        style={size !== 'sm' ? { width: '2.5rem', height: '2.5rem' } : {}}
      >
        <span className="visually-hidden">{text}</span>
      </Spinner>
      {showText && <span className="ms-2">{text}</span>}
    </div>
  );

  if (fullscreen) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'var(--bs-body-bg-transparent, rgba(255, 255, 255, 0.7))',
          zIndex: 9999,
        }}
      >
        {spinnerComponent}
      </div>
    );
  }

  if (centered) {
    return (
      <div className="d-flex justify-content-center align-items-center w-100 h-100 my-5">
        {spinnerComponent}
      </div>
    );
  }

  return spinnerComponent;
};

Loader.propTypes = {
  fullscreen: PropTypes.bool,
  centered: PropTypes.bool,
  variant: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md']),
  text: PropTypes.string,
  showText: PropTypes.bool,
};

export default Loader;