import React from 'react';
import { Link } from 'react-router-dom';
import './NotFound.css';

// Importation d'une icône pertinente depuis une bibliothèque comme React Icons
import { FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <FiAlertTriangle className="not-found-icon" />
        <h1 className="not-found-title">Erreur 404 | Page Introuvable</h1>
        <p className="not-found-message">
          Désolé, la page que vous cherchez n'a pas pu être trouvée. Il est possible que l'adresse ait été mal saisie ou que la page ait été déplacée.
        </p>
        <p className="not-found-suggestion">
          Voici quelques liens qui pourraient vous être utiles :
        </p>
        <div className="not-found-links">
          <Link to="/dashboard" className="not-found-link">
            Retour au Tableau de Bord
          </Link>
          <Link to="/support" className="not-found-link">
            Contacter le Support
          </Link>
          <Link to="/" className="not-found-link">
            Page d'Accueil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;