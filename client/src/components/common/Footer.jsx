// ==============================================================================
//                Composant Pied de Page (Footer)
//
// Ce composant affiche le pied de page de l'application.
// Il est conçu pour être simple et afficher des informations essentielles
// comme le copyright et la version de l'application.
//
// L'année est calculée dynamiquement pour être toujours à jour.
// ==============================================================================

import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  return (
    <footer className="footer bg-light border-top mt-auto py-3">
      <Container>
        <div className="d-flex justify-content-between align-items-center">
          <span className="text-muted">
            © {currentYear} ERP Commercial & Comptable Sénégal. Tous droits réservés.
          </span>
          <span className="text-muted">
            Version {appVersion}
          </span>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;