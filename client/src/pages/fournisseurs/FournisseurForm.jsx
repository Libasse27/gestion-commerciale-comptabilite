// client/src/pages/fournisseurs/FournisseurForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

import FormField from '../../components/forms/FormField';
import Loader from '../../components/common/Loader';
import { isRequired, isValidEmail } from '../../utils/validators';
import { createFournisseur, updateFournisseur, fetchFournisseurById, reset } from '../../store/slices/fournisseursSlice';
import { PersonFill, EnvelopeFill, TelephoneFill } from 'react-bootstrap-icons';

const FournisseurForm = () => {
  const [formData, setFormData] = useState({
    nom: '', email: '', telephone: '', adresse: '', contactPrincipal: '', ninea: ''
  });
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: fournisseurId } = useParams();
  const isEditing = !!fournisseurId;

  const { fournisseurCourant, status, message } = useSelector((state) => state.fournisseurs);
  const isLoading = status === 'loading';
  const { addNotification } = useNotification();

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchFournisseurById(fournisseurId));
    }
    return () => dispatch(reset());
  }, [fournisseurId, dispatch, isEditing]);

  useEffect(() => {
    if (isEditing && fournisseurCourant) {
      setFormData({
        nom: fournisseurCourant.nom || '',
        email: fournisseurCourant.email || '',
        telephone: fournisseurCourant.telephone || '',
        adresse: fournisseurCourant.adresse || '',
        contactPrincipal: fournisseurCourant.contactPrincipal || '',
        ninea: fournisseurCourant.ninea || ''
      });
    }
  }, [isEditing, fournisseurCourant]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    // Ajouter une validation simple ici
    if (!formData.nom) {
        addNotification('Le nom du fournisseur est obligatoire.', TOAST_TYPES.WARNING);
        return;
    }
    
    const action = isEditing 
      ? updateFournisseur({ fournisseurId, updateData: formData }) 
      : createFournisseur(formData);
      
    dispatch(action).unwrap()
      .then(() => {
        addNotification(`Fournisseur ${isEditing ? 'mis à jour' : 'créé'}.`, TOAST_TYPES.SUCCESS);
        navigate('/fournisseurs');
      })
      .catch((err) => addNotification(err, TOAST_TYPES.ERROR));
  };

  if (isLoading && isEditing) return <Loader centered />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditing ? 'Modifier le Fournisseur' : 'Nouveau Fournisseur'}</h1>
        <Button as={Link} to="/fournisseurs" variant="light">Retour</Button>
      </div>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit} noValidate>
            <Row>
              <Col md={6}>
                <FormField label="Nom du Fournisseur *" name="nom" value={formData.nom} onChange={handleChange} icon={<PersonFill />} />
              </Col>
              <Col md={6}>
                <FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} icon={<EnvelopeFill />} />
              </Col>
            </Row>
            <Row>
                <Col md={6}>
                    <FormField label="Téléphone" name="telephone" value={formData.telephone} onChange={handleChange} icon={<TelephoneFill />} />
                </Col>
                <Col md={6}>
                    <FormField label="Contact Principal" name="contactPrincipal" value={formData.contactPrincipal} onChange={handleChange} icon={<PersonFill />} />
                </Col>
            </Row>
            <FormField label="Adresse" name="adresse" as="textarea" rows={3} value={formData.adresse} onChange={handleChange} />
            <FormField label="NINEA" name="ninea" value={formData.ninea} onChange={handleChange} />
            
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={() => navigate('/fournisseurs')} className="me-2">Annuler</Button>
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

export default FournisseurForm;