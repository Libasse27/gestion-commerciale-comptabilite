// client/src/pages/produits/ProduitDetail.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Button, Tabs, Tab, Badge } from 'react-bootstrap';
import { BoxSeam, PencilSquare } from 'react-bootstrap-icons';

import { fetchProduitById, reset } from '../../store/slices/produitsSlice';
import { formatCurrency, formatDate } from '../../utils/formatters';
import Loader from '../../components/common/Loader';

const ProduitDetail = () => {
  const { id: produitId } = useParams();
  const dispatch = useDispatch();

  const { produitCourant, status, message } = useSelector((state) => state.produits);
  const isLoading = status === 'loading';

  useEffect(() => {
    if (produitId) {
      dispatch(fetchProduitById(produitId));
    }
    return () => {
      dispatch(reset());
    };
  }, [produitId, dispatch]);

  if (isLoading && !produitCourant) {
    return <Loader centered />;
  }
  if (status === 'failed' && !produitCourant) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }
  if (!produitCourant) {
    return null;
  }

  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1 className="h2"><BoxSeam className="me-3" />{produitCourant.nom}</h1>
          <p className="text-muted mb-0">Référence : {produitCourant.reference}</p>
        </Col>
        <Col className="text-end">
          <Button as={Link} to={`/produits/${produitId}/modifier`} variant="primary">
            <PencilSquare className="me-2" /> Modifier
          </Button>
        </Col>
      </Row>

      <Tabs defaultActiveKey="info" id="produit-detail-tabs" className="mb-3">
        <Tab eventKey="info" title="Informations Générales">
          <Card className="shadow-sm">
            <Card.Body>
                <p><strong>Type :</strong> <Badge bg="info">{produitCourant.type}</Badge></p>
                <p><strong>Catégorie :</strong> {produitCourant.categorie?.nom || 'N/A'}</p>
                <p><strong>Description :</strong> {produitCourant.description || 'N/A'}</p>
                <hr />
                <h5 className="mb-3">Tarification (HT)</h5>
                <p><strong>Prix de Vente :</strong> {formatCurrency(produitCourant.prixVenteHT)}</p>
                <p><strong>Coût d'Achat :</strong> {formatCurrency(produitCourant.coutAchatHT)}</p>
                <p><strong>Taux de TVA :</strong> {produitCourant.tauxTVA}%</p>
                <hr />
                <p><strong>Créé le :</strong> {formatDate(produitCourant.createdAt)}</p>
            </Card.Body>
          </Card>
        </Tab>
        <Tab eventKey="stock" title="Stock" disabled={!produitCourant.suiviStock}>
            <Card><Card.Body><p>Informations sur le stock... (à implémenter)</p></Card.Body></Card>
        </Tab>
      </Tabs>
    </>
  );
};

export default ProduitDetail;