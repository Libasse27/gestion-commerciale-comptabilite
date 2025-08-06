// client/src/components/common/Footer.jsx
import React from 'react';
import { Container } from 'react-bootstrap';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const appVersion = import.meta.env.VITE_APP_VERSION || '1.0.0';

  return (
    <footer className="footer bg-light border-top mt-auto py-3">
      <Container fluid className="px-4">
        <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center text-center">
          <small className="text-muted mb-2 mb-sm-0">
            © {currentYear} {import.meta.env.VITE_APP_NAME || 'ERP Sénégal'}. Tous droits réservés.
          </small>
          <small className="text-muted">
            Version {appVersion}
          </small>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;