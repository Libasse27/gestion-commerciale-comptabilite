// client/src/pages/comptabilite/BilanPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { JournalBookmark } from 'react-bootstrap-icons';

import { fetchBilan } from '../../store/slices/comptabiliteSlice';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyUtils';
import { formatDate } from '../../utils/formatters';

const BilanPage = () => {
  const dispatch = useDispatch();
  const { bilan, statusReports, message } = useSelector((state) => state.comptabilite);
  const isLoading = statusReports === 'loading';
  
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);

  const handleGenerate = () => {
      dispatch(fetchBilan(dateFin));
  }
  
  // Helper pour rendre les postes du bilan
  const renderBilanSection = (title, postes, total) => (
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
              <tfoot>
                  <tr className="fw-bold">
                      <td colSpan="2">Total {title}</td>
                      <td className="text-end">{formatCurrency(total)}</td>
                  </tr>
              </tfoot>
          </Table>
      </>
  );

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><JournalBookmark className="me-3" />Bilan Comptable</h1></Col>
      </Row>

      <Card className="shadow-sm mb-4">
          <Card.Body>
              <Row className="align-items-end">
                  <Col md={4}><Form.Group><Form.Label>Bilan à la date du</Form.Label><Form.Control type="date" value={dateFin} onChange={e => setDateFin(e.target.value)} /></Form.Group></Col>
                  <Col md={4}><Button onClick={handleGenerate} disabled={isLoading}>{isLoading ? 'Génération...' : 'Générer le Bilan'}</Button></Col>
              </Row>
          </Card.Body>
      </Card>

      {isLoading && <Loader centered />}
      {statusReports === 'failed' && <div className="alert alert-danger">Erreur : {message}</div>}
      {statusReports === 'succeeded' && bilan && (
        <Card className="shadow-sm">
            <Card.Header>
                <h5>Bilan pour l'exercice {bilan.exerciceAnnee} au {formatDate(bilan.dateCloture)}</h5>
            </Card.Header>
            <Card.Body>
                <Row>
                    <Col md={6}>{renderBilanSection('Actif', bilan.actif.postes, bilan.actif.total)}</Col>
                    <Col md={6}>{renderBilanSection('Passif', bilan.passif.postes, bilan.passif.total)}</Col>
                </Row>
                <hr/>
                <div className={`text-center p-3 rounded ${bilan.equilibre ? 'bg-success-light' : 'bg-danger-light'}`}>
                    <h5 className={bilan.equilibre ? 'text-success' : 'text-danger'}>
                        {bilan.equilibre ? 'Bilan Équilibré' : 'Bilan Déséquilibré'}
                    </h5>
                    <p className="mb-0">Total Actif : {formatCurrency(bilan.actif.total)} | Total Passif : {formatCurrency(bilan.passif.total)}</p>
                </div>
            </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default BilanPage;