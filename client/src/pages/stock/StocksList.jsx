// client/src/pages/stock/StocksListPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { BoxSeam, ClipboardCheck } from 'react-bootstrap-icons';

import { fetchEtatStock } from '../../store/slices/stockSlice';
import { useDebounce } from '../../hooks/useDebounce';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';

const StocksListPage = () => {
  const dispatch = useDispatch();
  const { etatsStock, pagination, status, message } = useSelector((state) => state.stock);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);
  // Recherche non implémentée côté backend pour ce modèle complexe, donc on la désactive pour l'instant.
  // const [searchQuery, setSearchQuery] = useState('');
  // const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    dispatch(fetchEtatStock({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Produit', accessor: 'produit.nom', Cell: ({ row }) => <Link to={`/produits/${row.produit._id}`}>{row.produit.nom}</Link> },
    { Header: 'Référence', accessor: 'produit.reference' },
    { Header: 'Dépôt', accessor: 'depot.nom' },
    { Header: 'Quantité en Stock', accessor: 'quantite' },
    { Header: 'Seuil d\'Alerte', accessor: 'seuilAlerte' },
    { Header: 'Statut', accessor: 'statut', Cell: ({ row }) => {
        if (row.quantite <= 0) return <Badge bg="danger">En rupture</Badge>;
        if (row.quantite <= row.seuilAlerte) return <Badge bg="warning">Stock bas</Badge>;
        return <Badge bg="success">En stock</Badge>;
    }},
  ], []);

  if (status === 'failed' && etatsStock.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1>État du Stock</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/stock/inventaires/nouveau">
                <ClipboardCheck className="me-2" /> Démarrer un inventaire
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        {/* <Card.Header><SearchBar onSearch={setSearchQuery} placeholder="Rechercher par nom, référence..." /></Card.Header> */}
        <Card.Body className="p-0">
            <Table columns={columns} data={etatsStock} isLoading={isLoading} />
        </Card.Body>
        {pagination && pagination.pages > 1 && (
            <Card.Footer>
                <Pagination
                    currentPage={currentPage}
                    totalCount={pagination.total}
                    pageSize={pagination.limit}
                    onPageChange={setCurrentPage}
                />
            </Card.Footer>
        )}
      </Card>
    </div>
  );
};

export default StocksListPage;