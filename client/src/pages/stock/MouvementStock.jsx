// client/src/pages/stock/MouvementStockPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { Card, Row, Col, Badge } from 'react-bootstrap';
import { ListUl } from 'react-bootstrap-icons';

import { fetchMouvementsProduit } from '../../store/slices/stockSlice';
import { fetchProduitById } from '../../store/slices/produitsSlice';
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import Loader from '../../components/common/Loader';
import { formatDateTime } from '../../utils/formatters';

const MouvementStockPage = () => {
  const dispatch = useDispatch();
  const { produitId } = useParams();

  const { mouvements, pagination, statusMouvements } = useSelector((state) => state.stock);
  const { produitCourant, status: statusProduit } = useSelector((state) => state.produits);
  const isLoading = statusMouvements === 'loading' || statusProduit === 'loading';

  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (produitId) {
      dispatch(fetchProduitById(produitId));
      dispatch(fetchMouvementsProduit({ produitId, params: { page: currentPage } }));
    }
  }, [produitId, currentPage, dispatch]);

  const columns = useMemo(() => [
    { Header: 'Date', accessor: 'createdAt', Cell: ({ value }) => formatDateTime(value) },
    { Header: 'Type', accessor: 'type', Cell: ({ value }) => {
        const isEntry = ['entree_achat', 'ajustement_positif', 'retour_client'].includes(value);
        return <Badge bg={isEntry ? 'success' : 'danger'}>{value.replace(/_/g, ' ')}</Badge>;
    }},
    { Header: 'Quantité', accessor: 'quantite', Cell: ({ row }) => {
        const isEntry = ['entree_achat', 'ajustement_positif', 'retour_client'].includes(row.type);
        return <span className={isEntry ? 'text-success' : 'text-danger'}>{isEntry ? '+' : '-'}{row.quantite}</span>;
    }},
    { Header: 'Stock Avant', accessor: 'stockAvant' },
    { Header: 'Stock Après', accessor: 'stockApres' },
    { Header: 'Dépôt', accessor: 'depot.nom' },
    { Header: 'Référence', accessor: 'referenceDocument' },
    { Header: 'Par', accessor: 'creePar.firstName' },
  ], []);

  if (isLoading && !produitCourant) return <Loader centered />;

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col>
            <h1 className="h2"><ListUl className="me-3" />Historique du Stock</h1>
            <h3>{produitCourant?.nom} <small className="text-muted">({produitCourant?.reference})</small></h3>
        </Col>
        <Col className="text-end">
            <Link to="/stock/etats" className="btn btn-light">Retour à l'état du stock</Link>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={mouvements} isLoading={isLoading} />
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

export default MouvementStockPage;