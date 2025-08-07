// client/src/pages/comptabilite/EcritureForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col, Table } from 'react-bootstrap';
import { PlusCircleFill, TrashFill, JournalPlus } from 'react-bootstrap-icons';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

import FormField from '../../components/forms/FormField';
import Select from '../../components/forms/Select';
import DatePicker from '../../components/forms/DatePicker';
import Loader from '../../components/common/Loader';
import { formatCurrency } from '../../utils/currencyUtils';
import { roundTo } from '../../utils/numberUtils';

import { fetchPlanComptable, createEcriture } from '../../store/slices/comptabiliteSlice';

const EcritureForm = () => {
  const [formData, setFormData] = useState({
    journalId: '',
    date: new Date(),
    libelle: '',
    lignes: [
      { compte: '', libelle: '', debit: 0, credit: 0 },
      { compte: '', libelle: '', debit: 0, credit: 0 },
    ],
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { addNotification } = useNotification();

  const { planComptable, status } = useSelector(state => state.comptabilite);
  const isLoading = status === 'loading';

  useEffect(() => {
    dispatch(fetchPlanComptable());
    // dispatch(fetchJournaux()); // À créer
  }, [dispatch]);

  const compteOptions = planComptable.map(c => ({ value: c._id, label: `${c.numero} - ${c.libelle}` }));
  const journalOptions = []; // À remplir avec les vrais journaux

  const handleLigneChange = (index, e) => {
    const { name, value } = e.target;
    const newLignes = [...formData.lignes];
    newLignes[index][name] = value;
    setFormData(prev => ({ ...prev, lignes: newLignes }));
  };

  const addLigne = () => {
    setFormData(prev => ({
      ...prev,
      lignes: [...prev.lignes, { compte: '', libelle: '', debit: 0, credit: 0 }],
    }));
  };

  const removeLigne = (index) => {
    setFormData(prev => ({
      ...prev,
      lignes: formData.lignes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const totalDebit = formData.lignes.reduce((sum, l) => sum + Number(l.debit || 0), 0);
    const totalCredit = formData.lignes.reduce((sum, l) => sum + Number(l.credit || 0), 0);

    if (Math.abs(roundTo(totalDebit) - roundTo(totalCredit)) > 0.01) {
      return addNotification("L'écriture n'est pas équilibrée.", TOAST_TYPES.ERROR);
    }

    dispatch(createEcriture(formData))
      .unwrap()
      .then(() => {
        addNotification('Écriture créée avec succès.', TOAST_TYPES.SUCCESS);
        navigate('/comptabilite/ecritures');
      })
      .catch((err) => addNotification(err, TOAST_TYPES.ERROR));
  };

  const totalDebit = formData.lignes.reduce((sum, l) => sum + Number(l.debit || 0), 0);
  const totalCredit = formData.lignes.reduce((sum, l) => sum + Number(l.credit || 0), 0);

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <JournalPlus className="me-3" />
          Nouvelle Écriture Comptable
        </h1>
        <Button as={Link} to="/comptabilite/ecritures" variant="light">
          Retour
        </Button>
      </div>

      <Form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <Card.Body className="p-4">
            <Row>
              <Col md={4}>
                <FormField label="Journal *">
                  <Select
                    options={journalOptions}
                    name="journalId"
                    value={formData.journalId}
                    onChange={e => setFormData(p => ({ ...p, journalId: e.target.value }))}
                  />
                </FormField>
              </Col>
              <Col md={4}>
                <Form.Label>Date *</Form.Label>
                <DatePicker
                  selected={formData.date}
                  onChange={date => setFormData(p => ({ ...p, date }))}
                />
              </Col>
              <Col md={4}>
                <FormField
                  label="Libellé général *"
                  name="libelle"
                  value={formData.libelle}
                  onChange={e => setFormData(p => ({ ...p, libelle: e.target.value }))}
                />
              </Col>
            </Row>

            <h5 className="mt-4">Mouvements</h5>
            <Table responsive>
              <thead>
                <tr>
                  <th>Compte</th>
                  <th>Libellé</th>
                  <th>Débit</th>
                  <th>Crédit</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {formData.lignes.map((ligne, index) => (
                  <tr key={index}>
                    <td>
                      <Select
                        options={compteOptions}
                        name="compte"
                        value={ligne.compte}
                        onChange={e => handleLigneChange(index, e)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        name="libelle"
                        value={ligne.libelle}
                        onChange={e => handleLigneChange(index, e)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        name="debit"
                        value={ligne.debit}
                        onChange={e => handleLigneChange(index, e)}
                      />
                    </td>
                    <td>
                      <Form.Control
                        type="number"
                        name="credit"
                        value={ligne.credit}
                        onChange={e => handleLigneChange(index, e)}
                      />
                    </td>
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
              <tfoot>
                <tr className="fw-bold">
                  <td colSpan="2" className="text-end">Totaux</td>
                  <td className={totalDebit !== totalCredit ? 'text-danger' : ''}>
                    {formatCurrency(totalDebit)}
                  </td>
                  <td className={totalDebit !== totalCredit ? 'text-danger' : ''}>
                    {formatCurrency(totalCredit)}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </Table>
            <Button variant="light" onClick={addLigne}>
              <PlusCircleFill className="me-2" />
              Ajouter une ligne
            </Button>

            <div className="d-flex justify-content-end mt-4">
              <Button
                variant="secondary"
                onClick={() => navigate('/comptabilite/ecritures')}
                className="me-2"
              >
                Annuler
              </Button>
              <Button
                variant="primary"
                type="submit"
                disabled={isLoading || totalDebit !== totalCredit}
              >
                {isLoading ? <Loader size="sm" /> : 'Enregistrer'}
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Form>
    </>
  );
};

export default EcritureForm;
