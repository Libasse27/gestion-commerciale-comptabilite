// client/src/pages/paiements/RelancesPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Badge, Card } from 'react-bootstrap';
import { EnvelopeCheck } from 'react-bootstrap-icons';

import { fetchRelances } from '../../store/slices/paiementsSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatDate } from '../../utils/formatters';

const RelancesPage = () => {
  const dispatch = useDispatch();
  const { relances, pagination, status } = useSelector((state) => state.paiements);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchRelances({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Date d\'envoi', accessor: 'createdAt', Cell: ({ value }) => formatDate(value) },
    { Header: 'Client', accessor: 'client.nom' },
    { Header: 'Facture', accessor: 'facture.numero', Cell: ({ row }) => <Link to={`/ventes/factures/${row.facture._id}`}>{row.facture.numero}</Link> },
    { Header: 'Niveau', accessor: 'niveau', Cell: ({ value }) => <Badge bg="warning">{`Niveau ${value}`}</Badge> },
    { Header: 'Méthode', accessor: 'methode' },
    { Header: 'Envoyé par', accessor: 'envoyePar', Cell: ({ value }) => value ? `${value.firstName} ${value.lastName}` : 'Système Automatique' },
  ], []);

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><EnvelopeCheck className="me-3" />Historique des Relances</h1></Col>
        {/* On pourrait ajouter un bouton pour déclencher le job manuellement */}
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={relances} isLoading={isLoading} emptyMessage="Aucune relance n'a été envoyée." />
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

export default RelancesPage;