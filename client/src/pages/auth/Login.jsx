// ==============================================================================
//                Page de Connexion de l'Application
//
// MISE À JOUR : Ajout d'icônes dans les champs et d'un bouton pour
// afficher/masquer le mot de passe pour une meilleure expérience utilisateur.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { EnvelopeFill, LockFill, EyeFill, EyeSlashFill } from 'react-bootstrap-icons'; // Import des icônes

// Importation de nos hooks et actions
import { useAuth } from '../../hooks/useAuth';
import { login, reset } from '../../store/slices/authSlice';

// Importation des composants UI
import Loader from '../../components/common/Loader';

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const { email, password } = formData;
  
  // Nouvel état pour gérer la visibilité du mot de passe
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isLoading, isError, isSuccess, message } = useAuth();

  // Correction de la boucle de rendu en séparant les useEffect
  useEffect(() => {
    if (isError) {
      toast.error(message || 'Une erreur est survenue.');
    }
    if (isSuccess || user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isError, isSuccess, message, navigate]);

  useEffect(() => {
    // Nettoie les états d'erreur/succès quand on quitte la page
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

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
            {/* Champ Email avec icône */}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Adresse Email</Form.Label>
              <InputGroup>
                <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
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
              </InputGroup>
            </Form.Group>

            {/* Champ Mot de passe avec icône et bouton pour afficher/cacher */}
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
                />
                <Button 
                  variant="outline-secondary" 
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Cacher le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </Button>
              </InputGroup>
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
              <Link to="/register" className="me-3">Créer un compte</Link>
              |
              <Link to="/forgot-password" className="ms-3">Mot de passe oublié ?</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default LoginPage;