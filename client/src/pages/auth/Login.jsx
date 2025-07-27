// ==============================================================================
//                Page de Connexion de l'Application
//
// Ce composant affiche le formulaire de connexion et gère la logique
// d'authentification de l'utilisateur.
//
// Il utilise maintenant le hook `useAuth` pour une lecture simplifiée
// de l'état d'authentification depuis le store Redux.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';

// Importation de nos hooks et actions
import { useAuth } from '../../hooks/useAuth';
import { login, reset } from '../../store/slices/authSlice';

// Importation des composants UI
import Loader from '../../components/common/Loader';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { email, password } = formData;

  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Utilisation de notre hook personnalisé `useAuth` pour simplifier la lecture du state.
  const { user, isLoading, isError, isSuccess, message } = useAuth();

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Une erreur est survenue.');
    }

    // `isSuccess` est utile pour déclencher la redirection une seule fois.
    // La vérification `user` est une sécurité si l'utilisateur arrive sur cette page
    // alors qu'il est déjà connecté.
    if (isSuccess || user) {
      navigate('/dashboard', { replace: true });
    }

    // Le `reset` est crucial pour nettoyer les états (isError, isSuccess, message)
    // afin qu'ils ne persistent pas lors des prochaines visites de la page.
    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.warn('Veuillez remplir tous les champs.');
    } else {
      dispatch(login({ email, password }));
    }
  };
  
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: 'var(--bs-light)' }}>
      <Card style={{ width: '400px' }} className="p-3 shadow-lg border-0">
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-3">
              {import.meta.env.VITE_APP_NAME || 'ERP Sénégal'}
            </h2>
            <p className="text-muted">Connectez-vous à votre espace</p>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Adresse Email</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={email}
                onChange={handleChange}
                placeholder="exemple@email.com"
                required
                autoFocus
                disabled={isLoading}
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
              <Form.Control
                type="password"
                name="password"
                value={password}
                onChange={handleChange}
                placeholder="Votre mot de passe"
                required
                disabled={isLoading}
              />
            </Form.Group>

            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                  <Loader size="sm" showText={true} text="Connexion..." variant="light" />
                ) : (
                  'Se Connecter'
                )}
              </Button>
            </div>
          </Form>

          <div className="mt-4 text-center">
            <small>
              <Link to="/forgot-password">Mot de passe oublié ?</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;