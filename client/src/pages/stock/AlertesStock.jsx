// client/src/pages/stock/AlertesStockPage.jsx
import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { ExclamationTriangleFill } from 'react-bootstrap-icons';

import { fetchAlertes } from '../../store/slices/stockSlice';
import Table from '../../components/common/Table';
import { formatDateTime } from '../../utils/formatters';

const AlertesStockPage = () => {
  const dispatch = useDispatch();
  const { alertes, statusAlertes, message } = useSelector((state) => state.stock);
  const isLoading = statusAlertes === 'loading';
  
  // Pour l'instant, on ne charge que les alertes actives
  React.useEffect(() => {
    dispatch(fetchAlertes({ statut: 'Active' }));
  }, [dispatch]);

  const columns = React.useMemo(() => [
    { Header: 'Produit', accessor: 'produit.nom', Cell: ({ row }) => <Link to={`/produits/${row.produit._id}`}>{row.produit.nom}</Link> },
    { Header: 'Référence', accessor: 'produit.reference' },
    { Header: 'Dépôt', accessor: 'depot.nom' },
    { Header: 'Qté Restante', accessor: 'quantiteRestante' },
    { Header: 'Seuil d\'Alerte', accessor: 'seuilAlerte' },
    { Header: 'Déclenchée le', accessor: 'createdAt', Cell: ({ value }) => formatDateTime(value) },
    { Header: 'Statut', accessor: 'statut', Cell: ({ value }) => <Badge bg="danger">{value}</Badge> },
  ], []);

  if (statusAlertes === 'failed') {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><ExclamationTriangleFill className="me-3 text-warning" />Alertes de Stock Actives</h1></Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table 
                columns={columns} 
                data={alertes} 
                isLoading={isLoading}
                emptyMessage="Aucune alerte de stock active pour le moment."
            />
        </Card.Body>
        {/* Pagination ici si nécessaire */}
      </Card>
    </div>
  );
};

export default AlertesStockPage;