// client/src/pages/rapports/RapportsComptablesPage.jsx
import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Book, JournalRichtext, JournalBookmark, GraphUp } from 'react-bootstrap-icons';

const rapports = [
    {
        title: 'Balance Générale',
        description: 'Consultez les soldes de tous vos comptes sur une période donnée.',
        link: '/comptabilite/balance',
        icon: <Book size={32} />
    },
    {
        title: 'Grand Livre',
        description: 'Affichez le détail de tous les mouvements pour un compte spécifique.',
        link: '/comptabilite/grand-livre',
        icon: <JournalRichtext size={32} />
    },
    {
        title: 'Bilan Comptable',
        description: 'Générez le bilan financier de votre entreprise à une date précise.',
        link: '/comptabilite/bilan',
        icon: <JournalBookmark size={32} />
    },
    {
        title: 'Compte de Résultat',
        description: 'Analysez la performance de votre entreprise sur une période.',
        link: '/comptabilite/resultat',
        icon: <GraphUp size={32} />
    },
];

const RapportsComptablesPage = () => {
  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1>Rapports Comptables</h1></Col>
      </Row>

      <Row xs={1} md={2} className="g-4">
        {rapports.map((rapport, idx) => (
          <Col key={idx}>
            <Card as={Link} to={rapport.link} className="h-100 text-decoration-none text-dark shadow-sm report-card">
              <Card.Body className="d-flex align-items-center">
                  <div className="me-4 text-primary">{rapport.icon}</div>
                  <div>
                      <Card.Title className="mb-1">{rapport.title}</Card.Title>
                      <Card.Text className="text-muted">{rapport.description}</Card.Text>
                  </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default RapportsComptablesPage;