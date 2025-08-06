// client/src/pages/ventes/DevisForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Table } from 'react-bootstrap';
import { PlusCircleFill, TrashFill } from 'react-bootstrap-icons';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

import FormField from '../../components/forms/FormField';
import Select from '../../components/forms/Select';
import DatePicker from '../../components/forms/DatePicker';
import Loader from '../../components/common/Loader';
import { calculateGrandTotals } from '../../utils/numberUtils';
import { formatCurrency } from '../../utils/currencyUtils';

import { fetchClients } from '../../store/slices/clientsSlice';
import { fetchProduits } from '../../store/slices/produitsSlice';
import { createDevis } from '../../store/slices/ventesSlice';

const DevisForm = () => {
  const [formData, setFormData] = useState({
    clientId: '',
    dateEmission: new Date(),
    validiteJours: 30,
    lignes: [{ produitId: '', quantite: 1, prixUnitaireHT: 0 }],
    notes: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const { clients } = useSelector(state => state.clients);
  const { produits } = useSelector(state => state.produits);
  const { status } = useSelector(state => state.ventes);
  const isLoading = status === 'loading';

  useEffect(() => {
    dispatch(fetchClients());
    dispatch(fetchProduits());
  }, [dispatch]);

  const clientOptions = clients.map(c => ({ value: c._id, label: `${c.nom} (${c.codeClient})` }));
  const produitOptions = produits.map(p => ({ value: p._id, label: `${p.nom} (${p.reference})` }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLigneChange = (index, e) => {
    const { name, value } = e.target;
    const newLignes = [...formData.lignes];
    newLignes[index][name] = value;

    if (name === 'produitId') {
      const selectedProduit = produits.find(p => p._id === value);
      newLignes[index].prixUnitaireHT = selectedProduit ? selectedProduit.prixVenteHT : 0;
    }

    setFormData(prev => ({ ...prev, lignes: newLignes }));
  };

  const addLigne = () => {
    setFormData(prev => ({
      ...prev,
      lignes: [...prev.lignes, { produitId: '', quantite: 1, prixUnitaireHT: 0 }]
    }));
  };

  const removeLigne = (index) => {
    const newLignes = formData.lignes.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, lignes: newLignes }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    dispatch(createDevis(formData))
      .unwrap()
      .then(() => {
        addNotification('Devis créé avec succès.', TOAST_TYPES.SUCCESS);
        navigate('/ventes');
      })
      .catch(err => addNotification(err, TOAST_TYPES.ERROR));
  };

  const totals = calculateGrandTotals(formData.lignes);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Nouveau Devis</h1>
        <Button as={Link} to="/ventes" variant="light">Retour</Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <Row>
              <Col md={6}>
                <FormField label="Client *" name="clientId" value={formData.clientId} onChange={handleChange}>
                  <Select options={clientOptions} placeholder="Sélectionner un client..." />
                </FormField>
              </Col>
              <Col md={3}>
                <Form.Label>Date d'émission</Form.Label>
                <DatePicker
                  selected={formData.dateEmission}
                  onChange={date => setFormData(p => ({ ...p, dateEmission: date }))}
                />
              </Col>
              <Col md={3}>
                <FormField
                  label="Validité (jours)"
                  name="validiteJours"
                  type="number"
                  value={formData.validiteJours}
                  onChange={handleChange}
                />
              </Col>
            </Row>

            <h5 className="mt-4">Lignes du devis</h5>
            <Table responsive>
              <thead>
                <tr>
                  <th>Produit/Service</th>
                  <th>Quantité</th>
                  <th>Prix U. HT</th>
                  <th>Total HT</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.lignes.map((ligne, index) => (
                  <tr key={index}>
                    <td>
                      <Select
                        options={produitOptions}
                        name="produitId"
                        value={ligne.produitId}
                        onChange={e => handleLigneChange(index, e)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        name="quantite"
                        value={ligne.quantite}
                        onChange={e => handleLigneChange(index, e)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        name="prixUnitaireHT"
                        value={ligne.prixUnitaireHT}
                        onChange={e => handleLigneChange(index, e)}
                      />
                    </td>
                    <td>{formatCurrency(ligne.quantite * ligne.prixUnitaireHT)}</td>
                    <td>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() => removeLigne(index)}
                      >
                        <TrashFill />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            <Button variant="light" onClick={addLigne}>
              <PlusCircleFill className="me-2" />
              Ajouter une ligne
            </Button>

            <Row className="mt-4">
              <Col md={7}>
                <FormField
                  label="Notes"
                  name="notes"
                  as="textarea"
                  rows={4}
                  value={formData.notes}
                  onChange={handleChange}
                />
              </Col>
              <Col md={5}>
                <Card>
                  <Card.Body>
                    <p>Total HT : <strong>{formatCurrency(totals.totalHT)}</strong></p>
                    <p>Total TVA : <strong>{formatCurrency(totals.totalTVA)}</strong></p>
                    <hr />
                    <h4 className="fw-bold">Total TTC : {formatCurrency(totals.totalTTC)}</h4>
                  </Card.Body>
                </Card>
              </Col>
            </Row>

            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={() => navigate('/ventes')} className="me-2">
                Annuler
              </Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? <Loader size="sm" /> : 'Créer le Devis'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Form>
    </>
  );
};

export default DevisForm;
