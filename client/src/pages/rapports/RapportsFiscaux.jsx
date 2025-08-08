// client/src/pages/rapports/RapportsFiscauxPage.jsx
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Form, Button, ListGroup } from 'react-bootstrap';
import { FileEarmarkMedical } from 'react-bootstrap-icons';

import { fetchDeclarationTVA } from '../../store/slices/rapportsSlice';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyUtils';

const RapportsFiscauxPage = () => {
  const dispatch = useDispatch();
  const { declarationTVA, status, message } = useSelector((state) => state.rapports);
  const isLoading = status === 'loading';
  
  const [periode, setPeriode] = useState({
      annee: new Date().getFullYear(),
      mois: new Date().getMonth() + 1
  });

  const handlePeriodeChange = (e) => setPeriode(prev => ({...prev, [e.target.name]: e.target.value}));
  const handleGenerate = () => dispatch(fetchDeclarationTVA(periode));

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><FileEarmarkMedical className="me-3" />Déclaration de TVA</h1></Col>
      </Row>

      <Card className="shadow-sm mb-4">
          <Card.Body>
              <Row className="align-items-end">
                  <Col md={4}><Form.Group><Form.Label>Année</Form.Label><Form.Control type="number" name="annee" value={periode.annee} onChange={handlePeriodeChange} /></Form.Group></Col>
                  <Col md={4}><Form.Group><Form.Label>Mois</Form.Label><Form.Control as="select" name="mois" value={periode.mois} onChange={handlePeriodeChange}>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>{m}</option>)}
                  </Form.Control></Form.Group></Col>
                  <Col md={4}><Button onClick={handleGenerate} disabled={isLoading} className="w-100">{isLoading ? '...' : 'Générer la Déclaration'}</Button></Col>
              </Row>
          </Card.Body>
      </Card>

      {isLoading && <Loader centered />}
      {status === 'failed' && <div className="alert alert-danger">Erreur : {message}</div>}
      {status === 'succeeded' && declarationTVA && (
        <Card className="shadow-sm">
            <Card.Header>
                <h5>Déclaration pour la période : {declarationTVA.periode}</h5>
            </Card.Header>
            <Card.Body>
                <ListGroup variant="flush">
                    <ListGroup.Item>TVA Collectée : <span className="float-end">{formatCurrency(declarationTVA.tvaCollectee)}</span></ListGroup.Item>
                    <ListGroup.Item>TVA Déductible : <span className="float-end">{formatCurrency(declarationTVA.tvaDeductible)}</span></ListGroup.Item>
                    <ListGroup.Item>Crédit de TVA antérieur : <span className="float-end">{formatCurrency(declarationTVA.creditTvaAnterieur)}</span></ListGroup.Item>
                    <ListGroup.Item variant="primary" className="fw-bold">
                        {declarationTVA.tvaAPayer > 0 ? 'TVA à Payer' : 'Crédit de TVA à Reporter'} :
                        <span className="float-end">
                            {formatCurrency(declarationTVA.tvaAPayer > 0 ? declarationTVA.tvaAPayer : declarationTVA.creditTvaAReporter)}
                        </span>
                    </ListGroup.Item>
                </ListGroup>
            </Card.Body>
        </Card>
      )}
    </div>
  );
};

export default RapportsFiscauxPage;