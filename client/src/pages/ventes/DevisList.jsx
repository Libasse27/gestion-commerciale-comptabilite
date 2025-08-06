// client/src/pages/ventes/DevisListPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { PlusCircleFill } from 'react-bootstrap-icons';

import { fetchDevis } from '../../store/slices/ventesSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';

const DevisListPage = () => {
  const dispatch = useDispatch();
  const { devis, pagination, status, message } = useSelector((state) => state.ventes);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchDevis({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Numéro', accessor: 'numero', Cell: ({ row }) => <Link to={`/ventes/devis/${row._id}`}>{row.numero}</Link> },
    { Header: 'Client', accessor: 'client.nom' },
    { Header: 'Date Émission', accessor: 'dateEmission', Cell: ({ value }) => formatDate(value) },
    { Header: 'Date Validité', accessor: 'dateValidite', Cell: ({ value }) => formatDate(value) },
    { Header: 'Total TTC', accessor: 'totalTTC', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Statut', accessor: 'statut', Cell: ({ value }) => <Badge bg="info">{value}</Badge> }, // Améliorer les couleurs de badge
  ], []);

  if (status === 'failed' && devis.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1>Liste des Devis</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/ventes/devis/nouveau">
                <PlusCircleFill className="me-2" /> Nouveau Devis
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={devis} isLoading={isLoading} />
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

export default DevisListPage;