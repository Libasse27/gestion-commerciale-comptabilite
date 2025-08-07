// client/src/pages/comptabilite/BalancePage.jsx
import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { BookHalf } from 'react-bootstrap-icons';

import { fetchBalanceGenerale } from '../../store/slices/comptabiliteSlice';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyUtils';

const BalancePage = () => {
  const dispatch = useDispatch();
  const { balance, status, message } = useSelector((state) => state.comptabilite);
  const isLoading = status === 'loading';
  
  const [dates, setDates] = useState({
      dateDebut: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0]
  });

  const handleDateChange = (e) => {
      setDates(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  const handleGenerate = () => {
      dispatch(fetchBalanceGenerale(dates));
  }

  const columns = useMemo(() => [
    { Header: 'N° Compte', accessor: 'numero' },
    { Header: 'Libellé', accessor: 'libelle' },
    { Header: 'Solde Débit Ouv.', accessor: 'soldeDebitOuverture', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Solde Crédit Ouv.', accessor: 'soldeCreditOuverture', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Mvt Débit', accessor: 'debitMouvement', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Mvt Crédit', accessor: 'creditMouvement', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Solde Débit Final', accessor: 'soldeDebitFinal', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Solde Crédit Final', accessor: 'soldeCreditFinal', Cell: ({ value }) => formatCurrency(value) },
  ], []);

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><BookHalf className="me-3" />Balance Générale</h1></Col>
      </Row>

      <Card className="shadow-sm mb-4">
          <Card.Body>
              <Row className="align-items-end">
                  <Col md={4}><Form.Group><Form.Label>Date de début</Form.Label><Form.Control type="date" name="dateDebut" value={dates.dateDebut} onChange={handleDateChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label>Date de fin</Form.Label><Form.Control type="date" name="dateFin" value={dates.dateFin} onChange={handleDateChange} /></Form.Group></Col>
                  <Col md={4}><Button onClick={handleGenerate} disabled={isLoading}>{isLoading ? 'Génération...' : 'Générer la balance'}</Button></Col>
              </Row>
          </Card.Body>
      </Card>

      {isLoading && <Loader centered />}
      {status === 'failed' && <div className="alert alert-danger">Erreur : {message}</div>}
      {status === 'succeeded' && balance && (
        <Card className="shadow-sm">
            <Card.Header>Résultats pour la période du {dates.dateDebut} au {dates.dateFin}</Card.Header>
            <Card.Body className="p-0">
                <Table columns={columns} data={balance.lignes} />
            </Card.Body>
            <Card.Footer>
                {/* Afficher les totaux ici */}
            </Card.Footer>
        </Card>
      )}
    </div>
  );
};

export default BalancePage;