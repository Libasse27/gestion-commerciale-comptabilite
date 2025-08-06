// client/src/pages/ventes/FacturesListPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { PlusCircleFill } from 'react-bootstrap-icons';

import { fetchFactures } from '../../store/slices/ventesSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';

const FacturesListPage = () => {
  const dispatch = useDispatch();
  const { factures, pagination, status, message } = useSelector((state) => state.ventes);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchFactures({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Numéro', accessor: 'numero', Cell: ({ row }) => <Link to={`/ventes/factures/${row._id}`}>{row.numero}</Link> },
    { Header: 'Client', accessor: 'client.nom' },
    { Header: 'Date Émission', accessor: 'dateEmission', Cell: ({ value }) => formatDate(value) },
    { Header: 'Date Échéance', accessor: 'dateEcheance', Cell: ({ value }) => formatDate(value) },
    { Header: 'Total TTC', accessor: 'totalTTC', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Solde Dû', accessor: 'soldeDu', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Statut', accessor: 'statut', Cell: ({ value }) => {
        let variant = 'secondary';
        if (value === 'Payée') variant = 'success';
        if (value === 'Partiellement payée') variant = 'primary';
        if (value === 'En retard') variant = 'danger';
        return <Badge bg={variant}>{value}</Badge>;
    }},
  ], []);

  if (status === 'failed' && factures.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1>Liste des Factures</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/ventes/factures/nouveau">
                <PlusCircleFill className="me-2" /> Nouvelle Facture
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={factures} isLoading={isLoading} />
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

export default FacturesListPage;