// client/src/pages/rapports/RapportsVentesPage.jsx
import React, { useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { BarChartLine } from 'react-bootstrap-icons';

import { fetchRapportVentes } from '../../store/slices/rapportsSlice';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import { formatCurrency, formatDate } from '../../utils/formatters';
import ExportExcel from '../../components/print/ExportExcel';

const RapportsVentesPage = () => {
  const dispatch = useDispatch();
  const { rapportVentes, status, message } = useSelector((state) => state.rapports);
  const isLoading = status === 'loading';
  
  const [dates, setDates] = useState({
      dateDebut: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0]
  });

  const handleDateChange = (e) => setDates(prev => ({...prev, [e.target.name]: e.target.value}));
  const handleGenerate = () => dispatch(fetchRapportVentes(dates));
  
  const columns = useMemo(() => [
    { Header: 'N° Facture', accessor: 'numero' },
    { Header: 'Client', accessor: 'client.nom' },
    { Header: 'Date', accessor: 'dateEmission', Cell: ({ value }) => formatDate(value) },
    { Header: 'Total TTC', accessor: 'totalTTC', Cell: ({ value }) => formatCurrency(value) },
    { Header: 'Statut', accessor: 'statut' },
  ], []);

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><BarChartLine className="me-3" />Rapport des Ventes</h1></Col>
        <Col className="text-end">
            {rapportVentes && <ExportExcel data={rapportVentes.details} columns={columns} filename={`rapport-ventes-${dates.dateDebut}-au-${dates.dateFin}`} />}
        </Col>
      </Row>

      <Card className="shadow-sm mb-4">
          <Card.Body>
              <Row className="align-items-end">
                  <Col md={4}><Form.Group><Form.Label>Date de début</Form.Label><Form.Control type="date" name="dateDebut" value={dates.dateDebut} onChange={handleDateChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label>Date de fin</Form.Label><Form.Control type="date" name="dateFin" value={dates.dateFin} onChange={handleDateChange} /></Form.Group></Col>
                  <Col md={4}><Button onClick={handleGenerate} disabled={isLoading} className="w-100">{isLoading ? 'Génération...' : 'Générer le Rapport'}</Button></Col>
              </Row>
          </Card.Body>
      </Card>

      {isLoading && <Loader centered />}
      {status === 'failed' && <div className="alert alert-danger">Erreur : {message}</div>}
      {status === 'succeeded' && rapportVentes && (
        <Card className="shadow-sm">
            <Card.Header>
                <h5>Résultats pour la période du {formatDate(rapportVentes.periode.dateDebut)} au {formatDate(rapportVentes.periode.dateFin)}</h5>
                <p className="mb-0"><strong>Total des Ventes :</strong> {formatCurrency(rapportVentes.totalVentes)} | <strong>Nombre de Factures :</strong> {rapportVentes.nombreFactures}</p>
            </Card.Header>
            <Card.Body className="p-0">
                <Table columns={columns} data={rapportVentes.details} />
            </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RapportsVentesPage;