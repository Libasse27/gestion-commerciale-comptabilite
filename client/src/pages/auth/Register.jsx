// ==============================================================================
//                Page d'Inscription de l'Application
//
// Ce composant affiche le formulaire d'inscription pour les nouveaux utilisateurs.
// Il gère la validation des champs, interagit avec le `authSlice` pour
// lancer l'action d'inscription (`registerUser`), et gère les états de
// chargement et d'erreur.
//
// Après une inscription réussie, l'utilisateur est automatiquement connecté
// et redirigé vers le tableau de bord.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Form, Button, InputGroup, Image, Row, Col } from 'react-bootstrap';
import { PersonFill, EnvelopeFill, LockFill } from 'react-bootstrap-icons';

// Importation de nos hooks et actions
import { useAuth } from '../../hooks/useAuth';
import { registerUser, reset } from '../../store/slices/authSlice';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';
import * as Validators from '../../utils/validators'; // Importe tous les validateurs

// Importation des composants
import Loader from '../../components/common/Loader';
import logo from '../../assets/images/logo.webp';

const RegisterPage = () => {
  // --- État du composant ---
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const { firstName, lastName, email, password, passwordConfirm } = formData;

  // --- Hooks React & Redux ---
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addNotification } = useNotification();
  const { user, isLoading, isError, isSuccess, message } = useAuth();

  // --- Effets de bord ---
  useEffect(() => {
    if (isError) {
      addNotification(message || "Une erreur est survenue.", TOAST_TYPES.ERROR);
      dispatch(reset());
    }

    if (isSuccess || user) {
      addNotification('Inscription réussie ! Bienvenue.', TOAST_TYPES.SUCCESS);
      navigate('/dashboard', { replace: true });
    }
  }, [user, isError, isSuccess, message, navigate, dispatch, addNotification]);

  // --- Gestionnaires d'événements ---
  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations côté client avant de dispatcher
    if (password !== passwordConfirm) {
      addNotification('Les mots de passe ne correspondent pas.', TOAST_TYPES.WARNING);
      return;
    }
    const passwordError = Validators.isStrongPassword(password);
    if (passwordError) {
      addNotification(passwordError, TOAST_TYPES.WARNING);
      return;
    }

    const userData = { firstName, lastName, email, password };
    dispatch(registerUser(userData));
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card style={{ width: '450px' }} className="shadow-lg">
        <Card.Body className="p-4 p-sm-5">
          <div className="text-center mb-4">
            <Image src={logo} alt="Logo ERP Sénégal" width={70} className="mb-3" />
            <h2 className="fw-bold mb-2">Créer un Compte</h2>
            <p className="text-muted">Rejoignez la plateforme ERP Sénégal</p>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            <Row>
              {/* Prénom */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="firstName">
                  <Form.Label>Prénom</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><PersonFill /></InputGroup.Text>
                    <Form.Control type="text" name="firstName" value={firstName} onChange={handleChange} placeholder="Votre prénom" required disabled={isLoading} />
                  </InputGroup>
                </Form.Group>
              </Col>
              {/* Nom */}
              <Col md={6}>
                <Form.Group className="mb-3" controlId="lastName">
                  <Form.Label>Nom</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><PersonFill /></InputGroup.Text>
                    <Form.Control type="text" name="lastName" value={lastName} onChange={handleChange} placeholder="Votre nom" required disabled={isLoading} />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>

            {/* Email */}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Adresse Email</Form.Label>
              <InputGroup>
                <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
                <Form.Control type="email" name="email" value={email} onChange={handleChange} placeholder="exemple@domaine.com" required disabled={isLoading} />
              </InputGroup>
            </Form.Group>

            {/* Mot de passe */}
            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
              <InputGroup>
                <InputGroup.Text><LockFill /></InputGroup.Text>
                <Form.Control type="password" name="password" value={password} onChange={handleChange} placeholder="Créez un mot de passe" required disabled={isLoading} />
              </InputGroup>
              <Form.Text className="text-muted">8+ caractères, 1 majuscule, 1 chiffre, 1 symbole.</Form.Text>
            </Form.Group>

            {/* Confirmation */}
            <Form.Group className="mb-4" controlId="passwordConfirm">
              <Form.Label>Confirmer le mot de passe</Form.Label>
              <InputGroup>
                <InputGroup.Text><LockFill /></InputGroup.Text>
                <Form.Control type="password" name="passwordConfirm" value={passwordConfirm} onChange={handleChange} placeholder="Confirmez le mot de passe" required disabled={isLoading} />
              </InputGroup>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={isLoading} size="lg">
                {isLoading ? <Loader size="sm" /> : "S'inscrire"}
              </Button>
            </div>
          </Form>

          <div className="mt-4 text-center">
            <small className="text-muted">
              Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RegisterPage;