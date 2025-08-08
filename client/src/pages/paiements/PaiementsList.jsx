// client/src/pages/paiements/PaiementsListPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { CashStack, PlusCircleFill } from 'react-bootstrap-icons';

import { fetchPaiements } from '../../store/slices/paiementsSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';

const PaiementsListPage = () => {
  const dispatch = useDispatch();
  const { paiements, pagination, status, message } = useSelector((state) => state.paiements);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchPaiements({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Date', accessor: 'datePaiement', Cell: ({ value }) => formatDate(value) },
    { Header: 'Référence', accessor: 'reference' },
    { Header: 'Tiers', accessor: 'tiers.nom' },
    { Header: 'Sens', accessor: 'sens', Cell: ({ value }) => <Badge bg={value === 'Entrant' ? 'success' : 'danger'}>{value}</Badge> },
    { Header: 'Montant', accessor: 'montant', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Mode de Paiement', accessor: 'modePaiement.nom' },
  ], []);

  if (status === 'failed' && paiements.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1><CashStack className="me-3" />Historique des Paiements</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/paiements/nouveau">
                <PlusCircleFill className="me-2" /> Enregistrer un Paiement
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={paiements} isLoading={isLoading} />
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

export default PaiementsListPage;