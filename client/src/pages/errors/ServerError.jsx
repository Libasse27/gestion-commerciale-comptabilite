// client/src/pages/errors/ServerError.jsx
// ==============================================================================
//           Page d'Erreur 500 (Erreur Interne du Serveur)
//
// Affiche un message générique lorsqu'une erreur critique et inattendue
// se produit dans l'application.
// ==============================================================================

import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { CloudSlash } from 'react-bootstrap-icons';

const ServerErrorPage = () => {
  
  // Fonction pour recharger la page, ce qui peut parfois résoudre des problèmes temporaires.
  const handleReload = () => {
    window.location.reload();
  };

  return (
    <Container>
      <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Col md={6} className="text-center">
          <CloudSlash className="text-warning mb-4" size={80} />
          <h1 className="display-4 fw-bold">Oups !</h1>
          <h2 className="fw-normal">Une erreur est survenue</h2>
          <p className="lead text-muted mb-4">
            Quelque chose s'est mal passé de notre côté. Notre équipe technique a été notifiée.
          </p>
          <p>
            Veuillez réessayer dans quelques instants.
          </p>
          <div className="mt-4">
            <Button onClick={handleReload} variant="primary" size="lg">
              Rafraîchir la page
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default ServerErrorPage;