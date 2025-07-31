// ==============================================================================
//           Page de Détail d'un Client
//
// MISE À JOUR : Utilisation du hook `useClients` pour une meilleure abstraction
// de l'état Redux.
// ==============================================================================

import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Button, Tabs, Tab, Spinner } from 'react-bootstrap';
import { PersonCircle, EnvelopeFill, TelephoneFill, GeoAltFill, PencilSquare } from 'react-bootstrap-icons';

// --- Importations internes ---
import { fetchClientById, clearSelectedClient } from '../../store/slices/clientsSlice';
import { formatDateFr } from '../../utils/formatters';
import { useClients } from '../../hooks/useClients'; // <-- Importer le nouveau hook
import ClientStats from './ClientStats';

const ClientDetail = () => {
  const { id: clientId } = useParams();
  const dispatch = useDispatch();

  // Utilisation du hook personnalisé pour lire l'état
  const { selectedClient, isLoading, isError, message } = useClients();

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientById(clientId));
    }
    // La fonction de nettoyage s'exécute quand on quitte la page
    return () => {
      dispatch(clearSelectedClient());
    };
  }, [clientId, dispatch]);


  if (isLoading && !selectedClient) {
    return <div className="text-center p-5"><Spinner animation="border" /> Chargement du client...</div>;
  }

  if (isError) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  if (!selectedClient) {
    // Ce cas peut se présenter brièvement entre le chargement et l'affichage
    return null;
  }

  return (
    <>
      {/* --- En-tête de la Page --- */}
      <Row className="align-items-center mb-4">
        <Col>
          <h1><PersonCircle className="me-3" />{selectedClient.nom}</h1>
          <p className="text-muted mb-0">Code Client : {selectedClient.codeClient}</p>
        </Col>
        <Col className="text-end">
          <Button as={Link} to={`/clients/${clientId}/modifier`} variant="primary">
            <PencilSquare className="me-2" />
            Modifier
          </Button>
        </Col>
      </Row>

      {/* --- Section des KPIs --- */}
      <div className="mb-4">
        <ClientStats clientId={clientId} />
      </div>

      {/* --- Onglets d'Informations --- */}
      <Tabs defaultActiveKey="info" id="client-detail-tabs" className="mb-3">
        <Tab eventKey="info" title="Informations Générales">
          <Card className="shadow-sm">
            <Card.Body>
                <p><strong><EnvelopeFill className="me-2"/>Email :</strong> {selectedClient.email || 'N/A'}</p>
                <p><strong><TelephoneFill className="me-2"/>Téléphone :</strong> {selectedClient.telephone || 'N/A'}</p>
                <p><strong><GeoAltFill className="me-2"/>Adresse :</strong> {selectedClient.adresse || 'N/A'}</p>
                <hr />
                <p><strong>NINEA :</strong> {selectedClient.ninea || 'N/A'}</p>
                <p><strong>Exonéré de TVA :</strong> {selectedClient.estExonereTVA ? 'Oui' : 'Non'}</p>
                <p><strong>Créé le :</strong> {formatDateFr(selectedClient.createdAt)}</p>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="factures" title="Factures">
            <Card><Card.Body><p>Historique des factures... (à implémenter)</p></Card.Body></Card>
        </Tab>
        <Tab eventKey="devis" title="Devis">
            <Card><Card.Body><p>Historique des devis... (à implémenter)</p></Card.Body></Card>
        </Tab>
      </Tabs>
    </>
  );
};

export default ClientDetail;