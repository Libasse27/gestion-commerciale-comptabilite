// client/src/pages/produits/CategoriesPage.jsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, ListGroup, Button, Form, InputGroup, Row, Col } from 'react-bootstrap';
import { TagFill, PlusCircleFill } from 'react-bootstrap-icons';
import { fetchCategories, createCategorie } from '../../store/slices/produitsSlice';
import Loader from '../../components/common/Loader';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

const CategoriesPage = () => {
  const dispatch = useDispatch();
  const { categories, statusCategories } = useSelector((state) => state.produits);
  const isLoading = statusCategories === 'loading';
  const { addNotification } = useNotification();

  const [newCategoryName, setNewCategoryName] = useState('');

  useEffect(() => {
    // Ne fetcher que si les catégories ne sont pas déjà chargées
    if (statusCategories === 'idle') {
      dispatch(fetchCategories());
    }
  }, [statusCategories, dispatch]);

  const handleCreateCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      addNotification('Le nom de la catégorie ne peut pas être vide.', TOAST_TYPES.WARNING);
      return;
    }
    dispatch(createCategorie({ nom: newCategoryName }))
      .unwrap()
      .then(() => {
        addNotification('Catégorie créée avec succès.', TOAST_TYPES.SUCCESS);
        setNewCategoryName('');
      })
      .catch((err) => addNotification(err, TOAST_TYPES.ERROR));
  };

  return (
    <div>
      <Row className="mb-4 align-items-center">
        <Col><h1>Catégories de Produits</h1></Col>
      </Row>

      <Row>
        <Col md={8}>
          <Card className="shadow-sm">
            <Card.Header>Liste des catégories</Card.Header>
            <Card.Body>
              {isLoading && <Loader centered />}
              {!isLoading && (
                <ListGroup variant="flush">
                  {categories.map(cat => (
                    <ListGroup.Item key={cat._id} className="d-flex justify-content-between align-items-center">
                      {cat.nom}
                      {/* TODO: Ajouter boutons Modifier/Supprimer */}
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="shadow-sm">
            <Card.Header>Nouvelle Catégorie</Card.Header>
            <Card.Body>
              <Form onSubmit={handleCreateCategory}>
                <InputGroup>
                  <InputGroup.Text><TagFill /></InputGroup.Text>
                  <Form.Control
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="Nom de la catégorie"
                    disabled={isLoading}
                  />
                </InputGroup>
                <div className="d-grid mt-3">
                  <Button type="submit" disabled={isLoading}>
                    <PlusCircleFill className="me-2" />
                    Ajouter
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

export default CategoriesPage;