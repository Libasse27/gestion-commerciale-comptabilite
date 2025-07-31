// ==============================================================================
//           Composant Formulaire pour la Création/Modification d'un Client
//
// MISE À JOUR : Utilise maintenant le hook `useFormValidator` pour une gestion
// propre et centralisée de la validation des champs.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { toast } from 'react-toastify';

// --- Importations internes ---
import FormField from '../../components/forms/FormField';
import Loader from '../../components/common/Loader';
import { useFormValidator } from '../../hooks/useFormValidator';
import { isRequired, isValidEmail, isValidSenegalPhone, composeValidators } from '../../utils/validators';
import { createClient, updateClient, fetchClientById } from '../../store/slices/clientsSlice';
import { PersonFill, EnvelopeFill, TelephoneFill, GeoAltFill } from 'react-bootstrap-icons';

// Règles de validation pour le formulaire
const clientValidationRules = {
  nom: isRequired,
  email: composeValidators(isRequired, isValidEmail),
  telephone: isValidSenegalPhone, // Optionnel, donc pas de isRequired
};


const ClientForm = () => {
  const [formData, setFormData] = useState({
    nom: '', email: '', telephone: '', adresse: '',
    ninea: '', estExonereTVA: false,
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: clientId } = useParams();
  const isEditing = Boolean(clientId);

  // Utilisation du hook pour la validation
  const { errors, validateField, validateForm } = useFormValidator(formData, clientValidationRules);
  
  const { isLoading } = useSelector((state) => state.clients);

  // En mode édition, charger les données du client
  useEffect(() => {
    if (isEditing) {
      dispatch(fetchClientById(clientId))
        .unwrap() // Permet d'attraper le résultat ou l'erreur
        .then((clientData) => {
          // On ne garde que les champs pertinents pour le formulaire
          const { nom, email, telephone, adresse, ninea, estExonereTVA } = clientData.data.client;
          setFormData({ nom, email, telephone, adresse, ninea, estExonereTVA });
        })
        .catch(err => toast.error(err));
    }
  }, [clientId, dispatch, isEditing]);


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
    validateField(name, newValue); // Valider le champ à la volée
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) { // Valider tout le formulaire avant soumission
      return toast.warn('Veuillez corriger les erreurs dans le formulaire.');
    }
    
    try {
      const action = isEditing
        ? updateClient({ id: clientId, updateData: formData })
        : createClient(formData);
      
      await dispatch(action).unwrap(); // `unwrap` lève une erreur en cas de `rejected`

      toast.success(`Client ${isEditing ? 'mis à jour' : 'créé'} avec succès !`);
      navigate('/clients');

    } catch (error) {
      toast.error(error || 'Une erreur est survenue.');
    }
  };

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>{isEditing ? 'Modifier le Client' : 'Nouveau Client'}</h1>
          <Button as={Link} to="/clients" variant="light">Retour à la liste</Button>
      </div>
      <Card className="shadow-sm">
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit} noValidate>
            <Row>
              <Col md={6}>
                <FormField
                  label="Nom du Client *"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  error={errors.nom}
                  icon={<PersonFill />}
                  placeholder="Nom de l'entreprise ou nom complet"
                />
              </Col>
              <Col md={6}>
                <FormField
                  label="Adresse Email *"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  error={errors.email}
                  icon={<EnvelopeFill />}
                  placeholder="contact@exemple.com"
                />
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <FormField
                  label="Téléphone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                  error={errors.telephone}
                  icon={<TelephoneFill />}
                  placeholder="77 123 45 67"
                />
              </Col>
              <Col md={6}>
                <FormField label="NINEA" name="ninea" value={formData.ninea} onChange={handleChange} />
              </Col>
            </Row>

            <FormField
              label="Adresse"
              name="adresse"
              as="textarea"
              rows={3}
              value={formData.adresse}
              onChange={handleChange}
            />
            
            <Form.Group className="mb-4">
              <Form.Check type="switch" id="estExonereTVA" name="estExonereTVA"
                label="Client exonéré de TVA"
                checked={formData.estExonereTVA}
                onChange={handleChange} />
            </Form.Group>

            <div className="d-flex justify-content-end">
              <Button variant="secondary" onClick={() => navigate('/clients')} className="me-2">Annuler</Button>
              <Button variant="primary" type="submit" disabled={isLoading}>
                {isLoading ? <Loader size="sm" showText={false} /> : (isEditing ? 'Enregistrer' : 'Créer Client')}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </>
  );
};

export default ClientForm;