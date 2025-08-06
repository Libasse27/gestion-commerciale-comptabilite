// client/src/pages/auth/Register.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Form, Button, InputGroup, Image, Row, Col } from 'react-bootstrap';
import { PersonFill, EnvelopeFill, LockFill } from 'react-bootstrap-icons';

import { useAuth } from '../../hooks/useAuth';
import { register, reset } from '../../store/slices/authSlice';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';
import * as Validators from '../../utils/validators';
import Loader from '../../components/common/Loader';
import logo from '../../assets/images/logo.webp';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  });
  const { firstName, lastName, email, password, passwordConfirm } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addNotification } = useNotification();
  const { user, status, message } = useAuth();
  const isLoading = status === 'loading';

  useEffect(() => {
    if (status === 'failed') {
      addNotification(message || "Une erreur est survenue.", TOAST_TYPES.ERROR);
      dispatch(reset());
    }

    if (status === 'succeeded' || user) {
      addNotification('Inscription réussie ! Bienvenue.', TOAST_TYPES.SUCCESS);
      navigate('/dashboard', { replace: true });
    }
  }, [user, status, message, navigate, dispatch, addNotification]);

  const handleChange = (e) => {
    setFormData((prevState) => ({ ...prevState, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return addNotification('Les mots de passe ne correspondent pas.', TOAST_TYPES.WARNING);
    }
    const passwordError = Validators.isStrongPassword(password);
    if (passwordError) {
      return addNotification(passwordError, TOAST_TYPES.WARNING);
    }
    const emailError = Validators.isValidEmail(email);
    if (emailError) {
      return addNotification(emailError, TOAST_TYPES.WARNING);
    }
    if (!firstName || !lastName) {
      return addNotification("Le prénom et le nom sont requis.", TOAST_TYPES.WARNING);
    }

    dispatch(register({ firstName, lastName, email, password }));
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card style={{ width: '450px' }} className="shadow-lg">
        <Card.Body className="p-4 p-sm-5">
          <div className="text-center mb-4">
            <Image src={logo} alt="Logo ERP Sénégal" width={70} className="mb-3" />
            <h2 className="fw-bold mb-2">Créer un Compte</h2>
            <p className="text-muted">Rejoignez notre plateforme</p>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="firstName">
                  <Form.Label>Prénom</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><PersonFill /></InputGroup.Text>
                    <Form.Control type="text" name="firstName" value={firstName} onChange={handleChange} placeholder="Votre prénom" required disabled={isLoading} />
                  </InputGroup>
                </Form.Group>
              </Col>
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

            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Adresse Email</Form.Label>
              <InputGroup>
                <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
                <Form.Control type="email" name="email" value={email} onChange={handleChange} placeholder="exemple@domaine.com" required disabled={isLoading} />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-3" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
              <InputGroup>
                <InputGroup.Text><LockFill /></InputGroup.Text>
                <Form.Control type="password" name="password" value={password} onChange={handleChange} placeholder="Créez un mot de passe" required disabled={isLoading} />
              </InputGroup>
              <Form.Text className="text-muted">8+ car., 1 maj., 1 chiffre, 1 symbole.</Form.Text>
            </Form.Group>

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
            <small className="text-muted">Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link></small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RegisterPage;