// client/src/pages/clients/ClientForm.jsx
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

import FormField from '../../components/forms/FormField';
import Loader from '../../components/common/Loader';
import useFormValidator from '../../hooks/useFormValidator'; // hook `useForm` est plus complet
import { isRequired, isValidEmail } from '../../utils/validators';
import { createClient, updateClient, fetchClientById, reset } from '../../store/slices/clientsSlice';
import { PersonFill, EnvelopeFill, TelephoneFill } from 'react-bootstrap-icons';

const clientValidationRules = {
  nom: isRequired,
  email: isValidEmail,
};

const ClientForm = () => {
  const [formData, setFormData] = useState({ nom: '', email: '', telephone: '', adresse: '', ninea: '' });
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: clientId } = useParams();
  const isEditing = !!clientId;

  // Remplacer par notre hook `useForm` qui gère état + validation
  const { errors, validate } = useFormValidator(formData, clientValidationRules);
  const { clientCourant, status, message } = useSelector((state) => state.clients);
  const isLoading = status === 'loading';
  const { addNotification } = useNotification();

  useEffect(() => {
    if (isEditing) {
      dispatch(fetchClientById(clientId));
    }
    // Nettoyer le slice en quittant
    return () => dispatch(reset());
  }, [clientId, dispatch, isEditing]);

  useEffect(() => {
    if (isEditing && clientCourant) {
      setFormData({
        nom: clientCourant.nom || '', email: clientCourant.email || '',
        telephone: clientCourant.telephone || '', adresse: clientCourant.adresse || '',
        ninea: clientCourant.ninea || ''
      });
    }
  }, [isEditing, clientCourant]);

  const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate(formData)) {
      addNotification('Veuillez corriger les erreurs.', TOAST_TYPES.WARNING);
      return;
    }
    
    const action = isEditing ? updateClient({ clientId, updateData: formData }) : createClient(formData);
    dispatch(action).unwrap()
      .then(() => {
        addNotification(`Client ${isEditing ? 'mis à jour' : 'créé'}.`, TOAST_TYPES.SUCCESS);
        navigate('/clients');
      })
      .catch((err) => addNotification(err, TOAST_TYPES.ERROR));
  };

  if (isLoading && isEditing) return <Loader centered />;

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEditing ? 'Modifier le Client' : 'Nouveau Client'}</h1>
        <Button as={Link} to="/clients" variant="light">Retour</Button>
      </div>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit} noValidate>
            <Row>
              <Col md={6}><FormField label="Nom *" name="nom" value={formData.nom} onChange={handleChange} error={errors.nom} icon={<PersonFill />} /></Col>
              <Col md={6}><FormField label="Email" name="email" type="email" value={formData.email} onChange={handleChange} error={errors.email} icon={<EnvelopeFill />} /></Col>
            </Row>
            {/* Autres champs... */}
            <div className="d-flex justify-content-end mt-4">
              <Button variant="secondary" onClick={() => navigate('/clients')} className="me-2">Annuler</Button>
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

export default ClientForm;