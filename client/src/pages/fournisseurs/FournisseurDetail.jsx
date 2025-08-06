// client/src/pages/fournisseurs/FournisseurDetail.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Button, Tabs, Tab } from 'react-bootstrap';
import { Building, EnvelopeFill, TelephoneFill, GeoAltFill, PencilSquare } from 'react-bootstrap-icons';

import { fetchFournisseurById, reset } from '../../store/slices/fournisseursSlice';
import { formatDate } from '../../utils/formatters';
import Loader from '../../components/common/Loader';

const FournisseurDetail = () => {
  const { id: fournisseurId } = useParams();
  const dispatch = useDispatch();

  const { fournisseurCourant, status, message } = useSelector((state) => state.fournisseurs);
  const isLoading = status === 'loading';

  useEffect(() => {
    if (fournisseurId) {
      dispatch(fetchFournisseurById(fournisseurId));
    }
    return () => {
      dispatch(reset()); // Utiliser `reset` pour nettoyer le statut et le fournisseur courant
    };
  }, [fournisseurId, dispatch]);

  if (isLoading && !fournisseurCourant) {
    return <Loader centered />;
  }
  if (status === 'failed' && !fournisseurCourant) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }
  if (!fournisseurCourant) {
    return null; // Ou un message "Fournisseur non trouvé"
  }

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="h2"><Building className="me-3" />{fournisseurCourant.nom}</h1>
          <p className="text-muted mb-0">Code Fournisseur : {fournisseurCourant.codeFournisseur}</p>
        </Col>
        <Col className="text-end">
          <Button as={Link} to={`/fournisseurs/${fournisseurId}/modifier`} variant="primary">
            <PencilSquare className="me-2" /> Modifier
          </Button>
        </Col>
      </Row>
      
      {/* TODO: Ajouter une section de KPIs pour les fournisseurs si nécessaire */}

      <Tabs defaultActiveKey="info" id="fournisseur-detail-tabs" className="mb-3">
        <Tab eventKey="info" title="Informations Générales">
          <Card className="shadow-sm">
            <Card.Body>
                <p><strong><EnvelopeFill className="me-2"/>Email :</strong> {fournisseurCourant.email || 'N/A'}</p>
                <p><strong><TelephoneFill className="me-2"/>Téléphone :</strong> {fournisseurCourant.telephone || 'N/A'}</p>
                <p><strong>Contact Principal :</strong> {fournisseurCourant.contactPrincipal || 'N/A'}</p>
                <p><strong><GeoAltFill className="me-2"/>Adresse :</strong> {fournisseurCourant.adresse || 'N/A'}</p>
                <hr />
                <p><strong>NINEA :</strong> {fournisseurCourant.ninea || 'N/A'}</p>
                <p><strong>Créé le :</strong> {formatDate(fournisseurCourant.createdAt)}</p>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="factures" title="Factures d'Achat">
            <Card><Card.Body><p>Historique des factures d'achat... (à implémenter)</p></Card.Body></Card>
        </Tab>
        <Tab eventKey="commandes" title="Commandes">
            <Card><Card.Body><p>Historique des commandes... (à implémenter)</p></Card.Body></Card>
        </Tab>
      </Tabs>
    </>
  );
};

export default FournisseurDetail;