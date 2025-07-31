// ==============================================================================
//                Page de Connexion de l'Application
//
// Component React pour la page de connexion. Gère l'état du formulaire,
// la soumission via Redux, et l'affichage des retours (erreurs, chargement).
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Form, Button, InputGroup, Image } from 'react-bootstrap';
import { EnvelopeFill, LockFill, EyeFill, EyeSlashFill } from 'react-bootstrap-icons';

// Importation de nos hooks et actions Redux
import { useAuth } from '../../hooks/useAuth';
import { loginUser, reset } from '../../store/slices/authSlice';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

// Importation des composants UI
import Loader from '../../components/common/Loader';
import logo from '../../assets/images/logo.webp'; // Assurez-vous d'avoir un logo ici

const LoginPage = () => {
  // --- État du composant ---
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const { email, password } = formData;

  // --- Hooks React & Redux ---
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { addNotification } = useNotification();
  
  // Le hook `useAuth` fournit l'état de l'authentification depuis Redux
  const { user, isLoading, isError, isSuccess, message } = useAuth();

  // --- Effets de bord (Side Effects) ---
  useEffect(() => {
    // Gère la redirection ou l'affichage d'erreurs après une tentative de connexion
    if (isError) {
      addNotification(message || 'Une erreur est survenue.', TOAST_TYPES.ERROR);
      dispatch(reset()); // Réinitialise l'état d'erreur
    }
    if (isSuccess || user) {
      addNotification('Connexion réussie !', TOAST_TYPES.SUCCESS);
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
    if (!email || !password) {
      addNotification('Veuillez remplir tous les champs.', TOAST_TYPES.WARNING);
    } else {
      dispatch(loginUser({ email, password }));
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card style={{ width: '400px' }} className="shadow-lg">
        <Card.Body className="p-4 p-sm-5">
          {/* Section Logo */}
          <div className="text-center mb-4">
            <Image src={logo} alt="Logo ERP Sénégal" width={80} className="mb-3" />
            <h2 className="fw-bold mb-2">
              {import.meta.env.VITE_APP_NAME || 'ERP Sénégal'}
            </h2>
            <p className="text-muted">Connectez-vous à votre espace</p>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            {/* Champ Email */}
            <Form.Group className="mb-3" controlId="email">
              <Form.Label>Adresse Email</Form.Label>
              <InputGroup>
                <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
                <Form.Control
                  type="email" name="email" value={email} onChange={handleChange}
                  placeholder="exemple@domaine.com"
                  required autoFocus disabled={isLoading}
                />
              </InputGroup>
            </Form.Group>

            {/* Champ Mot de passe */}
            <Form.Group className="mb-4" controlId="password">
              <Form.Label>Mot de passe</Form.Label>
              <InputGroup>
                <InputGroup.Text><LockFill /></InputGroup.Text>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password" value={password} onChange={handleChange}
                  placeholder="Votre mot de passe"
                  required disabled={isLoading}
                />
                <Button 
                  variant="outline-secondary"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Cacher" : "Afficher"}
                  disabled={isLoading}
                >
                  {showPassword ? <EyeSlashFill /> : <EyeFill />}
                </Button>
              </InputGroup>
            </Form.Group>

            {/* Bouton de Connexion */}
            <div className="d-grid">
              <Button variant="primary" type="submit" disabled={isLoading} size="lg">
                {isLoading ? <Loader size="sm" /> : 'Se Connecter'}
              </Button>
            </div>
          </Form>

          {/* Liens annexes */}
          <div className="mt-4 text-center">
            <small>
              <Link to="/forgot-password">Mot de passe oublié ?</Link>
            </small>
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