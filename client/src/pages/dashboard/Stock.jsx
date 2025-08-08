// client/src/pages/dashboard/StockDashboardPage.jsx
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col, Card, ListGroup, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Inboxes, BoxSeam, ExclamationTriangle } from 'react-bootstrap-icons';

import { fetchAlertes, fetchEtatStock } from '../../store/slices/stockSlice';
import StatCard from '../../components/charts/StatCard';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/formatters';

const StockDashboardPage = () => {
  const dispatch = useDispatch();
  
  const { alertes, etatsStock, status, statusAlertes } = useSelector((state) => state.stock);
  const isLoading = status === 'loading' || statusAlertes === 'loading';

  useEffect(() => {
    // Charger les 5 premières alertes actives
    dispatch(fetchAlertes({ statut: 'Active', limit: 5 }));
    // Charger l'état du stock pour calculer la valorisation
    dispatch(fetchEtatStock());
  }, [dispatch]);

  // Calculer la valorisation totale du stock
  const valorisationTotale = etatsStock.reduce((total, item) => {
      // Assumer que l'état du stock a le coût d'achat populé
      const coutAchat = item.produit?.coutAchatHT || 0;
      return total + (item.quantite * coutAchat);
  }, 0);

  return (
    <div>
      <div className="mb-4">
        <h1 className="h2"><Inboxes className="me-3" />Tableau de Bord - Stock</h1>
        <p className="text-muted">Vue d'ensemble de la gestion de vos stocks.</p>
      </div>

      {/* --- Section KPIs --- */}
      <Row className="g-4 mb-4">
        <Col md={6}>
            <StatCard
                icon={BoxSeam}
                title="Valorisation du Stock (Coût)"
                value={valorisationTotale}
                formatter={formatCurrency}
                iconVariant="primary"
                isLoading={isLoading}
            />
        </Col>
        <Col md={6}>
            <StatCard
                icon={ExclamationTriangle}
                title="Alertes de Stock Actives"
                value={alertes.length} // Simplifié, idéalement on aurait un total depuis l'API
                iconVariant="danger"
                isLoading={isLoading}
            />
        </Col>
      </Row>

      {/* --- Section Listes Rapides --- */}
      <Row className="g-4">
        <Col>
            <Card className="shadow-sm">
                <Card.Header>Dernières Alertes de Stock Actives</Card.Header>
                <ListGroup variant="flush">
                    {isLoading && <Loader centered />}
                    {!isLoading && alertes.length === 0 && <ListGroup.Item className="text-muted">Aucune alerte active.</ListGroup.Item>}
                    {!isLoading && alertes.map(alerte => (
                        <ListGroup.Item key={alerte._id} as={Link} to={`/produits/${alerte.produit._id}`} action>
                           <strong>{alerte.produit.nom}</strong> dans le dépôt <i>{alerte.depot.nom}</i>
                           <Badge bg="danger" className="float-end">Qté: {alerte.quantiteRestante}</Badge>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card>
        </Col>
        {/* On pourrait ajouter une colonne pour les derniers mouvements ici */}
      </Row>
    </div>
  );
};

export default StockDashboardPage;