// client/src/pages/paiements/PaiementForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Table } from 'react-bootstrap';
import { CashCoin, PlusCircleFill } from 'react-bootstrap-icons';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

import FormField from '../../components/forms/FormField';
import Select from '../../components/forms/Select';
import DatePicker from '../../components/forms/DatePicker';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyUtils';

import { fetchClients } from '../../store/slices/clientsSlice';
import { fetchFactures } from '../../store/slices/ventesSlice';
import { createEncaissement } from '../../store/slices/paiementsSlice';

const PaiementForm = () => {
  const [clientId, setClientId] = useState('');
  const [montantTotal, setMontantTotal] = useState(0);
  const [imputations, setImputations] = useState({}); // { factureId: montantImpute }
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  
  const { clients } = useSelector(state => state.clients);
  const { factures } = useSelector(state => state.ventes);
  const { status } = useSelector(state => state.paiements);
  const isLoading = status === 'loading';

  useEffect(() => {
    dispatch(fetchClients());
  }, [dispatch]);
  
  useEffect(() => {
      if (clientId) {
          // Charger les factures impayées pour ce client
          dispatch(fetchFactures({ client: clientId, statut: 'impayee' })); // Il faudra implémenter ce filtre backend
      }
  }, [clientId, dispatch]);

  const clientOptions = clients.map(c => ({ value: c._id, label: c.nom }));
  const facturesImpayees = factures.filter(f => f.soldeDu > 0);

  const handleImputationChange = (factureId, montant) => {
    setImputations(prev => ({ ...prev, [factureId]: Number(montant) }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const imputationsArray = Object.entries(imputations)
        .filter(([, montant]) => montant > 0)
        .map(([factureId, montantImpute]) => ({ factureId, montantImpute }));
    
    // Il faudra ajouter les autres champs (mode de paiement, etc.)
    const paiementData = { clientId, montant: montantTotal, imputations: imputationsArray };
    
    dispatch(createEncaissement(paiementData)).unwrap()
      .then(() => {
        addNotification('Paiement enregistré.', TOAST_TYPES.SUCCESS);
        navigate('/paiements');
      })
      .catch(err => addNotification(err, TOAST_TYPES.ERROR));
  };
  
  return (
    <>
      <Row className="mb-4 align-items-center">
        <Col><h1><CashCoin className="me-3" />Enregistrer un Encaissement</h1></Col>
        <Col className="text-end"><Button as={Link} to="/paiements" variant="light">Retour</Button></Col>
      </Row>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}><FormField label="Client *"><Select options={clientOptions} value={clientId} onChange={e => setClientId(e.target.value)} /></FormField></Col>
              <Col md={6}><FormField label="Montant Total Reçu *" type="number" value={montantTotal} onChange={e => setMontantTotal(e.target.value)} /></Col>
            </Row>
            
            <h5 className="mt-4">Imputer sur les factures</h5>
            <Table striped bordered>
              <thead><tr><th>N° Facture</th><th>Solde Dû</th><th>Montant à Imputer</th></tr></thead>
              <tbody>
                {facturesImpayees.map(f => (
                  <tr key={f._id}>
                    <td>{f.numero}</td>
                    <td>{formatCurrency(f.soldeDu)}</td>
                    <td><Form.Control type="number" value={imputations[f._id] || ''} onChange={e => handleImputationChange(f._id, e.target.value)} /></td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="primary" type="submit" disabled={isLoading}>{isLoading ? <Loader size="sm" /> : 'Enregistrer Paiement'}</Button>
            </div>
          </Form>
        </Card.Body>
        </Card>
    </>
  );
};

export default PaiementForm;