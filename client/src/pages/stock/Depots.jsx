// client/src/pages/stock/DepotsPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, Button, Form, InputGroup, Row, Col, Badge } from 'react-bootstrap';
import { HouseFill, PlusCircleFill } from 'react-bootstrap-icons';
import { fetchDepots, createDepot, reset } from '../../store/slices/stockSlice';
import Loader from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

const DepotsPage = () => {
  const dispatch = useDispatch();
  const { depots, status, message } = useSelector((state) => state.stock);
  const isLoading = status === 'loading';
  const { addNotification } = useNotification();

  const [newDepotData, setNewDepotData] = useState({ nom: '', adresse: '', type: 'Principal' });

  useEffect(() => {
    dispatch(fetchDepots());
    return () => dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
      if(status === 'failed') {
          addNotification(message, TOAST_TYPES.ERROR);
      }
  }, [status, message, addNotification]);

  const handleChange = (e) => {
      const { name, value } = e.target;
      setNewDepotData(prev => ({...prev, [name]: value}));
  }

  const handleCreateDepot = (e) => {
    e.preventDefault();
    if (!newDepotData.nom.trim()) {
      addNotification('Le nom du dépôt est obligatoire.', TOAST_TYPES.WARNING);
      return;
    }
    dispatch(createDepot(newDepotData))
      .unwrap()
      .then(() => {
        addNotification('Dépôt créé avec succès.', TOAST_TYPES.SUCCESS);
        setNewDepotData({ nom: '', adresse: '', type: 'Principal' });
      })
      .catch((err) => addNotification(err, TOAST_TYPES.ERROR));
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1>Gestion des Dépôts</h1></Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header>Liste des dépôts</Card.Header>
            <Card.Body>
              {isLoading && depots.length === 0 ? <Loader centered /> : (
                <ListGroup variant="flush">
                  {depots.map(depot => (
                    <ListGroup.Item key={depot._id} className="d-flex justify-content-between align-items-center">
                      <div>
                        <strong>{depot.nom}</strong> <Badge bg="secondary">{depot.type}</Badge>
                        <br />
                        <small className="text-muted">{depot.adresse}</small>
                      </div>
                      {/* TODO: Ajouter boutons Modifier/Désactiver */}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>Nouveau Dépôt</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateDepot}>
                <Form.Group className="mb-3">
                    <Form.Label>Nom du dépôt *</Form.Label>
                    <Form.Control name="nom" value={newDepotData.nom} onChange={handleChange} disabled={isLoading} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Adresse</Form.Label>
                    <Form.Control name="adresse" value={newDepotData.adresse} onChange={handleChange} disabled={isLoading} />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Type</Form.Label>
                    <Form.Select name="type" value={newDepotData.type} onChange={handleChange} disabled={isLoading}>
                        <option value="Principal">Principal</option>
                        <option value="Secondaire">Secondaire</option>
                        <option value="Virtuel">Virtuel</option>
                    </Form.Select>
                </Form.Group>
                <div className="d-grid mt-3">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader size="sm" /> : <><PlusCircleFill className="me-2" />Ajouter</>}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DepotsPage;