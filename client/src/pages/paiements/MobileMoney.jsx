// client/src/pages/paiements/MobileMoneyPage.jsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Phone } from 'react-bootstrap-icons';

const MobileMoneyPage = () => {
  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><Phone className="me-3" />Paiements par Mobile Money</h1></Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <p className="text-center text-muted p-5">
            L'interface pour l'initiation des paiements par Mobile Money n'est pas encore implémentée.
          </p>
          <p className="text-center text-muted">
            Cette section permettra de générer des liens de paiement pour les factures.
          </p>
        </Card.Body>
      </Card>
    </div>
  );
};

export default MobileMoneyPage;