// client/src/pages/achats/FacturesAchatPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card } from 'react-bootstrap';
import { PlusCircleFill } from 'react-bootstrap-icons';

import { fetchFacturesAchat } from '../../store/slices/achatsSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatCurrency, formatDate } from '../../utils/formatters';

const FacturesAchatPage = () => {
  const dispatch = useDispatch();
  const { facturesAchat, pagination, status, message } = useSelector((state) => state.achats);
  const isLoading = status === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    dispatch(fetchFacturesAchat({ page: currentPage }));
  }, [currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'N° Fournisseur', accessor: 'numeroFactureFournisseur' },
    { Header: 'N° Interne', accessor: 'numeroInterne', Cell: ({ row }) => <Link to={`/achats/factures/${row._id}`}>{row.numeroInterne}</Link> },
    { Header: 'Fournisseur', accessor: 'fournisseur.nom' },
    { Header: 'Date Facture', accessor: 'dateFacture', Cell: ({ value }) => formatDate(value) },
    { Header: 'Date Échéance', accessor: 'dateEcheance', Cell: ({ value }) => formatDate(value) },
    { Header: 'Total TTC', accessor: 'totalTTC', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Solde à Payer', accessor: 'soldeAPayer', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Statut', accessor: 'statut', Cell: ({ value }) => <Badge bg="info">{value}</Badge> },
  ], []);

  if (status === 'failed' && facturesAchat.length === 0) {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1>Factures Fournisseurs</h1></Col>
        <Col md={6} className="text-md-end">
            <Button as={Link} to="/achats/factures/nouveau">
                <PlusCircleFill className="me-2" /> Nouvelle Facture d'Achat
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={facturesAchat} isLoading={isLoading} />
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

export default FacturesAchatPage;