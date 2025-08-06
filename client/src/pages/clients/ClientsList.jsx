// client/src/pages/clients/ClientsListPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { PersonPlusFill } from 'react-bootstrap-icons';

import { fetchClients } from '../../store/slices/clientsSlice';
import { useClients } from '../../hooks/useClients';
import { useDebounce } from '../../hooks/useDebounce';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import SearchBar from '../../components/common/SearchBar';
import ExportExcel from '../../components/print/ExportExcel';
import { formatCurrency } from '../../utils/currencyUtils';

const ClientsListPage = () => {
  const dispatch = useDispatch();
  const { clients, pagination, status, message } = useClients();
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  useEffect(() => {
    dispatch(fetchClients({ page: currentPage, search: debouncedSearchQuery }));
  }, [currentPage, debouncedSearchQuery, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Code', accessor: 'codeClient' },
    { Header: 'Nom', accessor: 'nom', Cell: ({ row }) => <Link to={`/clients/${row._id}`}>{row.nom}</Link> },
    { Header: 'Email', accessor: 'email' },
    { Header: 'Téléphone', accessor: 'telephone' },
    { Header: 'Solde', accessor: 'solde', Cell: ({ value }) => <span className={value < 0 ? 'text-danger' : ''}>{formatCurrency(value)}</span> },
    { Header: 'Statut', accessor: 'isActive', Cell: ({ value }) => <Badge bg={value ? 'success' : 'secondary'}>{value ? 'Actif' : 'Inactif'}</Badge> },
    { Header: 'Actions', accessor: '_id', Cell: ({ value }) => <Button as={Link} to={`/clients/${value}/modifier`} variant="outline-primary" size="sm">Modifier</Button> }
  ], []);

  const columnsForExport = columns.filter(c => c.Header !== 'Actions');

  if (status === 'failed' && clients.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1>Clients</h1></Col>
        <Col md={6} className="text-md-end">
            <ExportExcel data={clients} columns={columnsForExport} filename="clients" />
            <Button as={Link} to="/clients/nouveau" className="ms-2">
                <PersonPlusFill className="me-2" /> Nouveau Client
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Header><SearchBar onSearch={setSearchQuery} /></Card.Header>
        <Card.Body className="p-0">
            <Table columns={columns} data={clients} isLoading={isLoading} />
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

export default ClientsListPage;