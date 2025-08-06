// client/src/pages/ventes/CommandesListPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Row, Col, Badge, Card } from 'react-bootstrap';

import { fetchCommandes } from '../../store/slices/ventesSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';

const CommandesListPage = () => {
  const dispatch = useDispatch();
  const { commandes, pagination, status, message } = useSelector((state) => state.ventes);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchCommandes({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Numéro', accessor: 'numero', Cell: ({ row }) => <Link to={`/ventes/commandes/${row._id}`}>{row.numero}</Link> },
    { Header: 'Client', accessor: 'client.nom' },
    { Header: 'Date Commande', accessor: 'dateCommande', Cell: ({ value }) => formatDate(value) },
    { Header: 'Total TTC', accessor: 'totalTTC', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Statut', accessor: 'statut', Cell: ({ value }) => <Badge bg="primary">{value}</Badge> },
  ], []);

  if (status === 'failed' && commandes.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1>Liste des Commandes</h1></Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={commandes} isLoading={isLoading} />
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

export default CommandesListPage;