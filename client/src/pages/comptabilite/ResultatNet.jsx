// client/src/pages/comptabilite/ResultatNetPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { GraphUp } from 'react-bootstrap-icons';

import { fetchCompteDeResultat } from '../../store/slices/comptabiliteSlice'; // A créer
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyUtils';

const ResultatNetPage = () => {
  const dispatch = useDispatch();
  // Il faudra ajouter 'compteDeResultat' à l'état du slice
  const { compteDeResultat, statusReports, message } = useSelector((state) => state.comptabilite);
  const isLoading = statusReports === 'loading';
  
  const [dates, setDates] = useState({
      dateDebut: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0]
  });

  const handleDateChange = (e) => setDates(prev => ({...prev, [e.target.name]: e.target.value}));

  const handleGenerate = () => dispatch(fetchCompteDeResultat(dates));
  
  const renderSection = (title, postes, total) => (
      <>
          <h4 className="mt-3">{title}</h4>
          <Table striped bordered hover responsive>
              <tbody>
                  {Object.entries(postes).map(([numero, { libelle, montant }]) => (
                      <tr key={numero}>
                          <td>{numero}</td>
                          <td>{libelle}</td>
                          <td className="text-end">{formatCurrency(montant)}</td>
                      </tr>
                  ))}
              </tbody>
              <tfoot><tr className="fw-bold"><td colSpan="2">Total {title}</td><td className="text-end">{formatCurrency(total)}</td></tr></tfoot>
          </Table>
      </>
  );

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><GraphUp className="me-3" />Compte de Résultat</h1></Col>
      </Row>

      <Card className="shadow-sm mb-4">
          <Card.Body>
              <Row className="align-items-end">
                  <Col md={4}><Form.Group><Form.Label>Date de début</Form.Label><Form.Control type="date" name="dateDebut" value={dates.dateDebut} onChange={handleDateChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label>Date de fin</Form.Label><Form.Control type="date" name="dateFin" value={dates.dateFin} onChange={handleDateChange} /></Form.Group></Col>
                  <Col md={4}><Button onClick={handleGenerate} disabled={isLoading}>{isLoading ? '...' : 'Générer'}</Button></Col>
              </Row>
          </Card.Body>
      </Card>

      {isLoading && <Loader centered />}
      {statusReports === 'failed' && <div className="alert alert-danger">Erreur : {message}</div>}
      {statusReports === 'succeeded' && compteDeResultat && (
        <Card className="shadow-sm">
            <Card.Header><h5>Résultat pour la période</h5></Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>{renderSection('Charges', compteDeResultat.charges.postes, compteDeResultat.charges.total)}</Col>
                    <Col md={6}>{renderSection('Produits', compteDeResultat.produits.postes, compteDeResultat.produits.total)}</Col>
                </Row>
                <hr/>
                <div className={`text-center p-3 rounded ${compteDeResultat.resultatNet >= 0 ? 'bg-success-light' : 'bg-danger-light'}`}>
                    <h4 className={compteDeResultat.resultatNet >= 0 ? 'text-success' : 'text-danger'}>
                        Résultat Net : {formatCurrency(compteDeResultat.resultatNet)}
                    </h4>
                </div>
            </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default ResultatNetPage;