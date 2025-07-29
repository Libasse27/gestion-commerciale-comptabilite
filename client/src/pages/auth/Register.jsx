// ==============================================================================
//                Page d'Inscription de l'Application
//
// Ce composant affiche le formulaire d'inscription pour les nouveaux utilisateurs.
// Il gère la validation des champs, interagit avec le `authSlice` pour
// lancer l'action d'inscription (`register`), et gère les états de
// chargement et d'erreur.
//
// Après une inscription réussie, le backend connecte automatiquement
// l'utilisateur, et ce composant le redirige vers le tableau de bord.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Card, Form, Button, InputGroup } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { PersonFill, EnvelopeFill, LockFill } from 'react-bootstrap-icons';

// Importation de nos hooks et actions
import { useAuth } from '../../hooks/useAuth';
import { register, reset } from '../../store/slices/authSlice';
import { isStrongPassword } from '../../utils/validators';

// Importation des composants UI
import Loader from '../../components/common/Loader';
import FormField from '../../components/forms/FormField';

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
  const { user, isLoading, isError, isSuccess, message } = useAuth();

  useEffect(() => {
    if (isError) {
      toast.error(message || 'Une erreur est survenue lors de l\'inscription.');
    }

    // Si l'inscription réussit ou si un utilisateur est déjà connecté, on redirige
    if (isSuccess || user) {
      navigate('/dashboard', { replace: true });
    }

    return () => {
      dispatch(reset()); // Nettoyer l'état en quittant la page
    };
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validations côté client
    if (password !== passwordConfirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    const passwordError = isStrongPassword(password);
    if (passwordError) {
        toast.error(passwordError);
        return;
    }

    const userData = { firstName, lastName, email, password };
    dispatch(register(userData));
  };
  
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: 'var(--bs-light)' }}>
      <Card style={{ width: '450px' }} className="p-3 shadow-lg border-0">
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="fw-bold mb-3">
              Créer un Compte
            </h2>
            <p className="text-muted">Rejoignez la plateforme ERP Sénégal</p>
          </div>

          <Form onSubmit={handleSubmit} noValidate>
            <FormField
              label="Prénom"
              name="firstName"
              value={firstName}
              onChange={handleChange}
              icon={<PersonFill />}
              disabled={isLoading}
              required
            />
            <FormField
              label="Nom de famille"
              name="lastName"
              value={lastName}
              onChange={handleChange}
              icon={<PersonFill />}
              disabled={isLoading}
              required
            />
            <FormField
              label="Adresse Email"
              type="email"
              name="email"
              value={email}
              onChange={handleChange}
              icon={<EnvelopeFill />}
              disabled={isLoading}
              required
            />
            <FormField
              label="Mot de passe"
              type="password"
              name="password"
              value={password}
              onChange={handleChange}
              icon={<LockFill />}
              disabled={isLoading}
              required
              helpText="Au moins 8 caractères, 1 majuscule, 1 chiffre, 1 symbole."
            />
            <FormField
              label="Confirmer le mot de passe"
              type="password"
              name="passwordConfirm"
              value={passwordConfirm}
              onChange={handleChange}
              icon={<LockFill />}
              disabled={isLoading}
              required
            />

            <div className="d-grid mt-4">
              <Button variant="primary" type="submit" disabled={isLoading} size="lg">
                {isLoading ? (
                  <Loader size="sm" showText={true} text="Création du compte..." variant="light" />
                ) : (
                  'S\'inscrire'
                )}
              </Button>
            </div>
          </Form>

          <div className="mt-4 text-center">
            <small>
              Vous avez déjà un compte ? <Link to="/login">Connectez-vous</Link>
            </small>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};

export default RegisterPage;