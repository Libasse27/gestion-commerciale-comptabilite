// client/src/pages/produits/ProduitForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

import FormField from '../../components/forms/FormField';
import Select from '../../components/forms/Select';
import Loader from '../../components/common/Loader';
import { fetchCategories } from '../../store/slices/produitsSlice';
// Importer les thunks pour produits...
// import { createProduit, updateProduit, fetchProduitById, reset } from '../../store/slices/produitsSlice';

const ProduitForm = () => {
  const [formData, setFormData] = useState({
    nom: '', reference: '', description: '', type: 'Produit', categorie: '',
    prixVenteHT: 0, coutAchatHT: 0, tauxTVA: 18, suiviStock: true
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: produitId } = useParams();
  const isEditing = !!produitId;

  const { categories, statusCategories } = useSelector((state) => state.produits);
  const { addNotification } = useNotification();
  // const { produitCourant, status } = useSelector((state) => state.produits);
  const isLoading = false; // Remplacer par status === 'loading'

  useEffect(() => {
    // Charger les catégories pour la liste déroulante
    dispatch(fetchCategories());
    // if (isEditing) {
    //   dispatch(fetchProduitById(produitId));
    // }
    // return () => dispatch(reset());
  }, [produitId, dispatch, isEditing]);

  // useEffect(() => {
  //   if (isEditing && produitCourant) {
  //     setFormData(produitCourant);
  //   }
  // }, [isEditing, produitCourant]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: val }));

    // Logique spéciale pour le suivi de stock
    if (name === 'type') {
        setFormData(prev => ({ ...prev, suiviStock: val === 'Produit' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    addNotification('Logique de soumission à implémenter.', TOAST_TYPES.INFO);
    // const action = isEditing ? updateProduit({ produitId, updateData: formData }) : createProduit(formData);
    // dispatch(action).unwrap().then(() => navigate('/produits'));
  };
  
  const categorieOptions = categories.map(cat => ({ value: cat._id, label: cat.nom }));

  if (isLoading && isEditing) return <Loader centered />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditing ? 'Modifier le Produit' : 'Nouveau Produit'}</h1>
        <Button as={Link} to="/produits" variant="light">Retour</Button>
      </div>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={8}><FormField label="Nom du produit/service *" name="nom" value={formData.nom} onChange={handleChange} /></Col>
              <Col md={4}><FormField label="Référence (SKU)" name="reference" value={formData.reference} onChange={handleChange} /></Col>
            </Row>
            <FormField label="Description" name="description" as="textarea" rows={3} value={formData.description} onChange={handleChange} />
            <Row>
                <Col md={6}>
                    <FormField label="Type *" name="type" value={formData.type} onChange={handleChange}>
                        <Select options={[{value: 'Produit', label: 'Produit'}, {value: 'Service', label: 'Service'}]} />
                    </FormField>
                </Col>
                <Col md={6}>
                    <FormField label="Catégorie" name="categorie" value={formData.categorie} onChange={handleChange}>
                        <Select options={categorieOptions} placeholder="Aucune catégorie" isLoading={statusCategories === 'loading'} />
                    </FormField>
                </Col>
            </Row>
            <hr />
            <h5 className="mb-3">Tarification</h5>
            <Row>
                <Col md={4}><FormField label="Prix de Vente (HT)" name="prixVenteHT" type="number" value={formData.prixVenteHT} onChange={handleChange} /></Col>
                <Col md={4}><FormField label="Coût d'Achat (HT)" name="coutAchatHT" type="number" value={formData.coutAchatHT} onChange={handleChange} /></Col>
                <Col md={4}><FormField label="Taux de TVA (%)" name="tauxTVA" type="number" value={formData.tauxTVA} onChange={handleChange} /></Col>
            </Row>
            <hr />
            <Form.Group className="mb-4">
              <Form.Check type="switch" id="suiviStock" name="suiviStock"
                label="Activer le suivi de stock pour cet article"
                checked={formData.suiviStock}
                onChange={handleChange}
                disabled={formData.type === 'Service'}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={() => navigate('/produits')} className="me-2">Annuler</Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? <Loader size="sm" /> : (isEditing ? 'Enregistrer' : 'Créer')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default ProduitForm;