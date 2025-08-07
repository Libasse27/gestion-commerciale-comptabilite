// client/src/pages/comptabilite/EcrituresPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { JournalText, PlusCircleFill } from 'react-bootstrap-icons';

import { fetchEcritures } from '../../store/slices/comptabiliteSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';

const EcrituresPage = () => {
  const dispatch = useDispatch();
  const { ecritures, pagination, status, message } = useSelector((state) => state.comptabilite);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchEcritures({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => formatDate(value) },
    { Header: 'N° Pièce', accessor: 'numeroPiece' },
    { Header: 'Journal', accessor: 'journal.code' },
    { Header: 'Libellé', accessor: 'libelle' },
    { Header: 'Débit', accessor: 'totalDebit', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Crédit', accessor: 'totalCredit', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Statut', accessor: 'statut', Cell: ({ value }) => <Badge bg={value === 'Validée' ? 'success' : 'warning'}>{value}</Badge> },
  ], []);

  if (status === 'failed' && ecritures.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1><JournalText className="me-3" />Journal Général</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/comptabilite/ecritures/nouveau">
                <PlusCircleFill className="me-2" /> Nouvelle Écriture
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={ecritures} isLoading={isLoading} />
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

export default EcrituresPage;