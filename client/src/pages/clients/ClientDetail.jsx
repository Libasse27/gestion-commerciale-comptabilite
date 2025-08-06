import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Button, Tabs, Tab, Spinner } from 'react-bootstrap';
import { PersonCircle, EnvelopeFill, TelephoneFill, GeoAltFill, PencilSquare } from 'react-bootstrap-icons';

import { fetchClientById, clearSelectedClient } from '../../store/slices/clientsSlice';
import { formatDate } from '../../utils/formatters';
import { useClients } from '../../hooks/useClients';
import ClientStats from './ClientStats';
import Loader from '../../components/common/Loader';

const ClientDetail = () => {
  const { id: clientId } = useParams();
  const dispatch = useDispatch();
  const { selectedClient, status, message } = useClients();
  const isLoading = status === 'loading';

  useEffect(() => {
    if (clientId) {
      dispatch(fetchClientById(clientId));
    }
    return () => {
      dispatch(clearSelectedClient());
    };
  }, [clientId, dispatch]);

  if (isLoading && !selectedClient) {
    return <Loader centered />;
  }
  if (status === 'failed' && !selectedClient) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }
  if (!selectedClient) {
    return null;
  }

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="h2"><PersonCircle className="me-3" />{selectedClient.nom}</h1>
          <p className="text-muted mb-0">Code : {selectedClient.codeClient}</p>
        </Col>
        <Col className="text-end">
          <Button as={Link} to={`/clients/${clientId}/modifier`} variant="primary">
            <PencilSquare className="me-2" /> Modifier
          </Button>
        </Col>
      </Row>

      <div className="mb-4">
        {/* <ClientStats clientId={clientId} /> */}
        <p>Section des KPIs (à venir)</p>
      </div>

      <Tabs defaultActiveKey="info" id="client-detail-tabs" className="mb-3">
        <Tab eventKey="info" title="Informations">
          <Card className="shadow-sm">
            <Card.Body>
                <p><strong>Email:</strong> {selectedClient.email || 'N/A'}</p>
                <p><strong>Téléphone:</strong> {selectedClient.telephone || 'N/A'}</p>
                <p><strong>Adresse:</strong> {selectedClient.adresse || 'N/A'}</p>
                <hr />
                <p><strong>NINEA:</strong> {selectedClient.ninea || 'N/A'}</p>
                <p><strong>Créé le:</strong> {formatDate(selectedClient.createdAt)}</p>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="factures" title="Factures"><Card><Card.Body>Historique des factures...</Card.Body></Card></Tab>
        <Tab eventKey="devis" title="Devis"><Card><Card.Body>Historique des devis...</Card.Body></Card></Tab>
      </Tabs>
    </>
  );
};

export default ClientDetail;