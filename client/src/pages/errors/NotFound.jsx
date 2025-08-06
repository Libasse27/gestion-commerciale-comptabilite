// client/src/pages/errors/NotFound.jsx
// ==============================================================================
//           Page d'Erreur 404 (Page Non Trouvée)
//
// Affiche un message clair à l'utilisateur lorsqu'il accède à une URL
// qui ne correspond à aucune route définie dans l'application.
// ==============================================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { SignpostSplit } from 'react-bootstrap-icons';

const NotFoundPage = () => {
  return (
    <Container>
      <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Col md={6} className="text-center">
          <SignpostSplit className="text-primary mb-4" size={80} />
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="fw-bold">Page Non Trouvée</h2>
          <p className="lead text-muted mb-4">
            Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
          </p>
          <Button as={Link} to="/" variant="primary" size="lg">
            Retourner à l'accueil
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage;