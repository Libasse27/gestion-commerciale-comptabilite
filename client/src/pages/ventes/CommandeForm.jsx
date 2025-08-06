// client/src/pages/ventes/CommandeForm.jsx
import React from 'react';
import { Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const CommandeForm = () => {
  return (
    <div>
      <h1>Nouvelle Commande</h1>
      <Card>
        <Card.Body>
          <p className="text-muted">
            La création de commandes manuelles n'est pas encore implémentée.
          </p>
          <p>
            Pour créer une commande, veuillez valider un devis et le convertir.
          </p>
          <Link to="/ventes/devis" className="btn btn-primary">
            Voir les devis
          </Link>
        </Card.Body>
      </Card>
    </div>
  );
};

export default CommandeForm;