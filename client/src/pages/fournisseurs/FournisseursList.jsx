// client/src/pages/fournisseurs/FournisseursListPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { BuildingFill } from 'react-bootstrap-icons';

import { fetchFournisseurs } from '../../store/slices/fournisseursSlice';
import { useDebounce } from '../../hooks/useDebounce';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';

const FournisseursListPage = () => {
  const dispatch = useDispatch();
  const { fournisseurs, pagination, status, message } = useSelector((state) => state.fournisseurs);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    dispatch(fetchFournisseurs({ page: currentPage, search: debouncedSearchQuery }));
  }, [currentPage, debouncedSearchQuery, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Code', accessor: 'codeFournisseur' },
    { Header: 'Nom du Fournisseur', accessor: 'nom', Cell: ({ row }) => <Link to={`/fournisseurs/${row._id}`}>{row.nom}</Link> },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Téléphone', accessor: 'telephone' },
    { Header: 'Statut', accessor: 'isActive', Cell: ({ value }) => <Badge bg={value ? 'success' : 'secondary'}>{value ? 'Actif' : 'Inactif'}</Badge> },
    { Header: 'Actions', accessor: '_id', Cell: ({ value }) => <Button as={Link} to={`/fournisseurs/${value}/modifier`} variant="outline-primary" size="sm">Modifier</Button> }
  ], []);

  if (status === 'failed' && fournisseurs.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1>Fournisseurs</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/fournisseurs/nouveau">
                <BuildingFill className="me-2" /> Nouveau Fournisseur
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header><SearchBar onSearch={setSearchQuery} placeholder="Rechercher par nom, code..." /></Card.Header>
        <Card.Body className="p-0">
            <Table columns={columns} data={fournisseurs} isLoading={isLoading} />
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

export default FournisseursListPage;