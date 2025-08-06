// client/src/pages/errors/Unauthorized.jsx
// ==============================================================================
//           Page d'Erreur 403 (Accès Interdit / Non Autorisé)
//
// Affiche un message à l'utilisateur lorsqu'il est bien connecté mais n'a pas
// les permissions nécessaires pour accéder à une ressource ou une page.
// ==============================================================================

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { ShieldLock } from 'react-bootstrap-icons';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  // Permet à l'utilisateur de revenir à la page précédente
  const goBack = () => navigate(-1);

  return (
    <Container>
      <Row className="justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Col md={6} className="text-center">
          <ShieldLock className="text-danger mb-4" size={80} />
          <h1 className="display-4 fw-bold">Accès Interdit</h1>
          <h2 className="fw-normal">Erreur 403</h2>
          <p className="lead text-muted mb-4">
            Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p>
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter votre administrateur.
          </p>
          <div className="mt-4">
            <Button onClick={goBack} variant="secondary" size="lg" className="me-2">
              Retour en arrière
            </Button>
            <Button as={Link} to="/dashboard" variant="primary" size="lg">
              Aller au tableau de bord
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default UnauthorizedPage;