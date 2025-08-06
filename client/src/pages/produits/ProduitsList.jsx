// client/src/pages/produits/ProduitsListPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { BoxSeam } from 'react-bootstrap-icons';

import { fetchProduits } from '../../store/slices/produitsSlice';
import { useDebounce } from '../../hooks/useDebounce';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import { formatCurrency } from '../../utils/currencyUtils';

const ProduitsListPage = () => {
  const dispatch = useDispatch();
  const { produits, pagination, status, message } = useSelector((state) => state.produits);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    dispatch(fetchProduits({ page: currentPage, search: debouncedSearchQuery }));
  }, [currentPage, debouncedSearchQuery, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Référence', accessor: 'reference' },
    { Header: 'Nom du Produit', accessor: 'nom', Cell: ({ row }) => <Link to={`/produits/${row._id}`}>{row.nom}</Link> },
    { Header: 'Type', accessor: 'type', Cell: ({ value }) => <Badge bg={value === 'Produit' ? 'primary' : 'secondary'}>{value}</Badge> },
    { Header: 'Catégorie', accessor: 'categorie.nom' },
    { Header: 'Prix de Vente HT', accessor: 'prixVenteHT', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Stock', accessor: 'quantiteEnStock', Cell: ({ row }) => row.suiviStock ? row.quantiteEnStock : 'N/A' },
    { Header: 'Actions', accessor: '_id', Cell: ({ value }) => <Button as={Link} to={`/produits/${value}/modifier`} variant="outline-primary" size="sm">Modifier</Button> }
  ], []);

  if (status === 'failed' && produits.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1>Catalogue de Produits</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/produits/nouveau">
                <BoxSeam className="me-2" /> Nouveau Produit
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header><SearchBar onSearch={setSearchQuery} placeholder="Rechercher par nom, référence..." /></Card.Header>
        <Card.Body className="p-0">
            <Table columns={columns} data={produits} isLoading={isLoading} />
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

export default ProduitsListPage;