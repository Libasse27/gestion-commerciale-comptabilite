
// client/src/pages/stock/InventairesListPage.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Badge, Card, Modal, Form } from 'react-bootstrap';
import { ClipboardCheck, PlusCircleFill } from 'react-bootstrap-icons';

import { fetchInventaires, startInventaire } from '../../store/slices/stockSlice';
import { fetchDepots } from '../../store/slices/stockSlice'; // Pour la modale
import Table from '../../components/common/Table';
import Pagination from '../../components/common/Pagination';
import { formatDateTime } from '../../utils/formatters';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';
import Select from '../../components/forms/Select';

const InventairesListPage = () => {
  const dispatch = useDispatch();
  const { inventaires, pagination, statusInventaires, depots } = useSelector((state) => state.stock);
  const isLoading = statusInventaires === 'loading';
  const { addNotification } = useNotification();
  
  const [showModal, setShowModal] = useState(false);
  const [selectedDepot, setSelectedDepot] = useState('');

  useEffect(() => {
    dispatch(fetchInventaires());
    dispatch(fetchDepots()); // Charger les dépôts pour le sélecteur
  }, [dispatch]);

  const columns = useMemo(() => [
    { Header: 'Numéro', accessor: 'numero', Cell: ({ row }) => <Link to={`/stock/inventaires/${row._id}`}>{row.numero}</Link> },
    { Header: 'Dépôt', accessor: 'depot.nom' },
    { Header: 'Date', accessor: 'dateInventaire', Cell: ({ value }) => formatDateTime(value) },
    { Header: 'Statut', accessor: 'statut', Cell: ({ value }) => <Badge bg={value === 'Validé' ? 'success' : (value === 'En cours' ? 'warning' : 'secondary')}>{value}</Badge> },
    { Header: 'Réalisé par', accessor: 'realisePar.firstName' },
  ], []);
  
  const depotOptions = depots.map(d => ({ value: d._id, label: d.nom }));

  const handleStartInventaire = () => {
      if (!selectedDepot) {
          addNotification('Veuillez sélectionner un dépôt.', TOAST_TYPES.WARNING);
          return;
      }
      dispatch(startInventaire(selectedDepot))
        .unwrap()
        .then((newInventaire) => {
            addNotification('Inventaire démarré avec succès.', TOAST_TYPES.SUCCESS);
            setShowModal(false);
            // On pourrait rediriger vers la page de détail de ce nouvel inventaire
        })
        .catch(err => addNotification(err, TOAST_TYPES.ERROR));
  }

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col md={6}><h1>Inventaires de Stock</h1></Col>
        <Col md={6} className="text-md-end">
            <Button onClick={() => setShowModal(true)}>
                <PlusCircleFill className="me-2" /> Démarrer un inventaire
            </Button>
        </Col>
      </Row>

      <Card className="shadow-sm">
        <Card.Body className="p-0">
            <Table columns={columns} data={inventaires} isLoading={isLoading} />
        </Card.Body>
        {/* Pagination ici si nécessaire */}
      </Card>

      {/* Modale pour démarrer un nouvel inventaire */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
              <Modal.Title>Démarrer un Nouvel Inventaire</Modal.Title>
          </Modal.Header>
          <Modal.Body>
              <p>Sélectionnez le dépôt dans lequel vous souhaitez commencer un comptage physique.</p>
              <Form.Group>
                  <Form.Label>Dépôt *</Form.Label>
                  <Select
                    options={depotOptions}
                    value={selectedDepot}
                    onChange={(e) => setSelectedDepot(e.target.value)}
                    placeholder="Choisir un dépôt..."
                  />
              </Form.Group>
          </Modal.Body>
          <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowModal(false)}>Annuler</Button>
              <Button variant="primary" onClick={handleStartInventaire} disabled={isLoading}>
                  <ClipboardCheck className="me-2" /> Démarrer
              </Button>
          </Modal.Footer>
      </Modal>
    </div>
  );
};

export default InventairesListPage;