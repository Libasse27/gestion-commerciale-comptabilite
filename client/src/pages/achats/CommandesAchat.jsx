// client/src/pages/achats/CommandesAchatPage.jsx
import React from 'react';
import { Card, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { PlusCircleFill } from 'react-bootstrap-icons';

const CommandesAchatPage = () => {
  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1>Commandes Fournisseurs</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/achats/commandes/nouveau">
                <PlusCircleFill className="me-2" /> Nouvelle Commande
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body>
          <p className="text-center text-muted p-5">
            La gestion des commandes d'achat n'est pas encore implémentée.
          </p>
          {/* Ici viendront la SearchBar, la Table et la Pagination */}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CommandesAchatPage;