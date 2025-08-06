// client/src/pages/auth/Login.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Form, Button, InputGroup, Image } from 'react-bootstrap';
import { EnvelopeFill, LockFill, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

import { useAuth } from '../../hooks/useAuth';
import { login, reset } from '../../store/slices/authSlice';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';
import Loader from '../../components/common/Loader';
import logo from '../../assets/images/logo.webp';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addNotification } = useNotification();

  const { user, status, message } = useAuth();
  const isLoading = status === 'loading';

  // ✅ Rediriger si déjà connecté
  useEffect(() => {
    if (user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  // ✅ Gérer les changements de statut après tentative de connexion
  useEffect(() => {
    if (status === 'failed') {
      addNotification(message || 'Une erreur est survenue.', TOAST_TYPES.ERROR);
      dispatch(reset());
    }

    if (status === 'succeeded') {
      addNotification('Connexion réussie ! Redirection...', TOAST_TYPES.SUCCESS);
      dispatch(reset());
      navigate('/dashboard', { replace: true });
    }
  }, [status, message, addNotification, dispatch, navigate]);

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      addNotification('Veuillez remplir tous les champs.', TOAST_TYPES.WARNING);
    } else {
      dispatch(login({ email, password }));
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card style={{ width: '400px' }} className="shadow-lg">
        <Card.Body className="p-4 p-sm-5">
          <div className="text-center mb-4">
            <Image src={logo} alt="Logo ERP Sénégal" width={80} className="mb-3" />
            <h2 className="fw-bold mb-2">{import.meta.env.VITE_APP_NAME || 'ERP Sénégal'}</h2>
            <p className="text-muted">Connectez-vous à votre espace</p>
          </div>

          <Form onSubmit={handleSubmit} noValidate autoComplete="on">
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Adresse Email</Form.Label>
              <InputGroup>
                <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="exemple@domaine.com"
                  required
                  autoFocus
                  disabled={isLoading}
                  autoComplete="email"
                />
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
              <InputGroup>
                <InputGroup.Text><LockFill /></InputGroup.Text>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={password}
                  onChange={handleChange}
                  placeholder="Votre mot de passe"
                  required
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <Button
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </Button>
              </InputGroup>
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={isLoading} size="lg">
                {isLoading ? <Loader size="sm" /> : 'Se Connecter'}
              </Button>
            </div>
          </Form>

          <div className="mt-4 text-center">
            <small><Link to="/forgot-password">Mot de passe oublié ?</Link></small>
          </div>
          <hr className="my-3" />
          <div className="text-center">
            <small className="text-muted">
              Pas encore de compte ? <Link to="/register">Inscrivez-vous</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;
