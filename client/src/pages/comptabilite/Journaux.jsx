// client/src/pages/comptabilite/JournauxPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, Button, Form, Row, Col } from 'react-bootstrap';
import { BookmarksFill, PlusCircleFill } from 'react-bootstrap-icons';

import { fetchJournaux, createJournal } from '../../store/slices/comptabiliteSlice'; // A créer
import Loader from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

const JournauxPage = () => {
  const dispatch = useDispatch();
  const { journaux, status, message } = useSelector((state) => state.comptabilite);
  const isLoading = status === 'loading';
  const { addNotification } = useNotification();

  const [newJournalData, setNewJournalData] = useState({ code: '', libelle: '', type: 'Operations Diverses' });

  useEffect(() => {
    dispatch(fetchJournaux());
  }, [dispatch]);

  const handleChange = (e) => setNewJournalData(prev => ({...prev, [e.target.name]: e.target.value}));

  const handleCreate = (e) => {
    e.preventDefault();
    if (!newJournalData.code || !newJournalData.libelle) {
      addNotification('Le code et le libellé sont obligatoires.', TOAST_TYPES.WARNING);
      return;
    }
    dispatch(createJournal(newJournalData))
      .unwrap()
      .then(() => {
        addNotification('Journal créé avec succès.', TOAST_TYPES.SUCCESS);
        setNewJournalData({ code: '', libelle: '', type: 'Operations Diverses' });
      })
      .catch(err => addNotification(err, TOAST_TYPES.ERROR));
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1><BookmarksFill className="me-3" />Journaux Comptables</h1></Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header>Liste des journaux</Card.Header>
            <Card.Body>
              {isLoading && journaux.length === 0 ? <Loader centered /> : (
                <ListGroup variant="flush">
                  {journaux.map(j => (
                    <ListGroup.Item key={j._id}>
                      <strong>{j.code}</strong> - {j.libelle} <span className="text-muted">({j.type})</span>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>Nouveau Journal</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreate}>
                <Form.Group className="mb-3"><Form.Label>Code *</Form.Label><Form.Control name="code" value={newJournalData.code} onChange={handleChange} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Libellé *</Form.Label><Form.Control name="libelle" value={newJournalData.libelle} onChange={handleChange} /></Form.Group>
                <Form.Group className="mb-3"><Form.Label>Type</Form.Label><Form.Select name="type" value={newJournalData.type} onChange={handleChange}>
                        <option value="Vente">Vente</option><option value="Achat">Achat</option>
                        <option value="Tresorerie">Trésorerie</option><option value="Operations Diverses">Opérations Diverses</option>
                </Form.Select></Form.Group>
                <div className="d-grid mt-3">
                  <Button type="submit" disabled={isLoading}><PlusCircleFill className="me-2" />Ajouter</Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default JournauxPage;