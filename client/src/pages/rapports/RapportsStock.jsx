// client/src/pages/rapports/RapportsStockPage.jsx
import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col } from 'react-bootstrap';
import { Inboxes } from 'react-bootstrap-icons';

import { fetchRapportStock } from '../../store/slices/rapportsSlice'; // A créer
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyUtils';

const RapportsStockPage = () => {
  const dispatch = useDispatch();
  const { rapportStock, status, message } = useSelector((state) => state.rapports);
  const isLoading = status === 'loading';

  useEffect(() => {
    dispatch(fetchRapportStock());
  }, [dispatch]);
  
  const columns = useMemo(() => [
    { Header: 'Produit', accessor: 'nom' },
    { Header: 'Référence', accessor: 'reference' },
    { Header: 'Quantité Totale', accessor: 'quantiteTotale' },
    { Header: 'Valorisation (Coût d\'Achat)', accessor: 'valorisation', Cell: ({ value }) => formatCurrency(value) },
  ], []);

  if (isLoading && !rapportStock) {
    return <Loader centered />;
  }
  if (status === 'failed') {
    return <div className="alert alert-danger">Erreur : {message}</div>;
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><Inboxes className="me-3" />Rapport de Stock</h1></Col>
      </Row>

      {rapportStock && (
        <Card className="shadow-sm">
            <Card.Header>
                <h5>Valorisation Totale du Stock : {formatCurrency(rapportStock.valorisationTotale)}</h5>
            </Card.Header>
            <Card.Body className="p-0">
                <Table columns={columns} data={rapportStock.details} isLoading={isLoading} />
            </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RapportsStockPage;