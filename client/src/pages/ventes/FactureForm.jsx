// client/src/pages/ventes/FactureForm.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const FactureForm = () => {
  return (
    <div>
      <h1>Nouvelle Facture</h1>
      <Card>
        <Card.Body>
          <p className="text-muted">
            La création de factures manuelles n'est pas encore implémentée.
          </p>
          <p>
            Pour créer une facture, veuillez créer une commande et la facturer depuis sa page de détail.
          </p>
          <Link to="/ventes/commandes" className="btn btn-primary">
            Voir les commandes
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
};

export default FactureForm;