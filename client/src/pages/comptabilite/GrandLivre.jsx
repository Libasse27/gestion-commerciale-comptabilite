// client/src/pages/comptabilite/GrandLivrePage.jsx
import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Row, Col, Form, Button } from 'react-bootstrap';
import { JournalRichtext } from 'react-bootstrap-icons';

import { fetchGrandLivre, fetchPlanComptable } from '../../store/slices/comptabiliteSlice';
import Table from '../../components/common/Table';
import Loader from '../../components/common/Loader';
import Select from '../../components/forms/Select';
import { formatCurrency, formatDate } from '../../utils/formatters';

const GrandLivrePage = () => {
  const dispatch = useDispatch();
  const { grandLivre, planComptable, statusReports, message } = useSelector((state) => state.comptabilite);
  const isLoading = statusReports === 'loading';
  
  const [filters, setFilters] = useState({
      compteId: '',
      dateDebut: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
      dateFin: new Date().toISOString().split('T')[0]
  });
  
  useEffect(() => {
    dispatch(fetchPlanComptable());
  }, [dispatch]);

  const compteOptions = planComptable.map(c => ({ value: c._id, label: `${c.numero} - ${c.libelle}` }));

  const handleFilterChange = (e) => {
      setFilters(prev => ({...prev, [e.target.name]: e.target.value}));
  }

  const handleGenerate = () => {
      if (filters.compteId) {
          dispatch(fetchGrandLivre(filters));
      }
  }

  const columns = useMemo(() => [
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => formatDate(value) },
    { Header: 'Journal', accessor: 'journal' },
    { Header: 'N° Pièce', accessor: 'numeroPiece' },
    { Header: 'Libellé', accessor: 'libelle' },
    { Header: 'Débit', accessor: 'debit', Cell: ({ value }) => value ? formatCurrency(value) : '' },
    { Header: 'Crédit', accessor: 'credit', Cell: ({ value }) => value ? formatCurrency(value) : '' },
    { Header: 'Solde', accessor: 'soldeProgressif', Cell: ({ value }) => formatCurrency(value) },
  ], []);

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><JournalRichtext className="me-3" />Grand Livre</h1></Col>
      </Row>

      <Card className="shadow-sm mb-4">
          <Card.Body>
              <Row className="align-items-end">
                  <Col md={4}><Form.Group><Form.Label>Compte</Form.Label><Select options={compteOptions} name="compteId" value={filters.compteId} onChange={handleFilterChange} /></Form.Group></Col>
                  <Col md={3}><Form.Group><Form.Label>Date de début</Form.Label><Form.Control type="date" name="dateDebut" value={filters.dateDebut} onChange={handleFilterChange} /></Form.Group></Col>
                  <Col md={3}><Form.Group><Form.Label>Date de fin</Form.Label><Form.Control type="date" name="dateFin" value={filters.dateFin} onChange={handleFilterChange} /></Form.Group></Col>
                  <Col md={2}><Button onClick={handleGenerate} disabled={isLoading || !filters.compteId} className="w-100">{isLoading ? '...' : 'Générer'}</Button></Col>
              </Row>
          </Card.Body>
      </Card>

      {isLoading && <Loader centered />}
      {statusReports === 'failed' && <div className="alert alert-danger">Erreur : {message}</div>}
      {statusReports === 'succeeded' && grandLivre && (
        <Card className="shadow-sm">
            <Card.Header>
                <h5>Grand Livre pour le compte : {grandLivre.compte.numero} - {grandLivre.compte.libelle}</h5>
                <p className="mb-0">Solde de départ : {formatCurrency(grandLivre.soldeDepart)}</p>
            </Card.Header>
            <Card.Body className="p-0">
                <Table columns={columns} data={grandLivre.lignes} />
            </Card.Body>
            <Card.Footer>
                <h5 className="text-end">Solde Final : {formatCurrency(grandLivre.soldeFinal)}</h5>
            </Card.Footer>
        </Card>
      )}
    </div>
  );
};

export default GrandLivrePage;