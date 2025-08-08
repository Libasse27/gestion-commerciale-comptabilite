// client/src/pages/paiements/EcheanciersPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Badge, Card } from 'react-bootstrap';
import { Calendar2Check } from 'react-bootstrap-icons';

import { fetchEcheances } from '../../store/slices/paiementsSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';

const EcheanciersPage = () => {
  const dispatch = useDispatch();
  const { echeances, pagination, status } = useSelector((state) => state.paiements);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchEcheances({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Date Échéance', accessor: 'dateEcheance', Cell: ({ value }) => formatDate(value) },
    { Header: 'Facture', accessor: 'facture.numero', Cell: ({ row }) => <Link to={`/ventes/factures/${row.facture._id}`}>{row.facture.numero}</Link> },
    { Header: 'Client', accessor: 'client.nom' },
    { Header: 'Montant Dû', accessor: 'montantDu', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Statut', accessor: 'statut', Cell: ({ value }) => <Badge bg={value === 'En retard' ? 'danger' : 'warning'}>{value}</Badge> },
  ], []);

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><Calendar2Check className="me-3" />Échéancier des Paiements</h1></Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={echeances} isLoading={isLoading} />
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

export default EcheanciersPage;