// ==============================================================================
//           Page de Demande de Réinitialisation de Mot de Passe
//
// Ce composant affiche un formulaire où l'utilisateur peut saisir son email
// pour recevoir un lien de réinitialisation de mot de passe.
//
// Il interagit avec le `authSlice` pour dispatcher l'action et afficher
// un message de confirmation à l'utilisateur.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Form, Button, InputGroup, Image } from 'react-bootstrap';
import { EnvelopeFill } from 'react-bootstrap-icons';

// Importation de nos hooks et actions
import { useAuth } from '../../hooks/useAuth';
import { requestPasswordReset, reset } from '../../store/slices/authSlice';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';

// Importation des composants
import Loader from '../../components/common/Loader';
import logo from '../../assets/images/logo.webp';

const ForgotPasswordPage = () => {
  // --- État du composant ---
  const [email, setEmail] = useState('');

  // --- Hooks React & Redux ---
  const dispatch = useDispatch();
  const { addNotification } = useNotification();
  const { isLoading, isError, isSuccess, message } = useAuth();

  // --- Effets de bord ---
  useEffect(() => {
    // Affiche une notification en cas d'erreur de l'API
    if (isError) {
      addNotification(message || 'Une erreur est survenue.', TOAST_TYPES.ERROR);
    }
    
    // Nettoie l'état d'authentification (isError, isSuccess) en quittant la page
    return () => {
      dispatch(reset());
    };
  }, [isError, message, dispatch, addNotification]);

  // --- Gestionnaires d'événements ---
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      addNotification('Veuillez saisir votre adresse email.', TOAST_TYPES.WARNING);
      return;
    }
    dispatch(requestPasswordReset(email));
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card style={{ width: '450px' }} className="shadow-lg">
        <Card.Body className="p-4 p-sm-5">
          {isSuccess ? (
            // --- Vue de Confirmation (si la requête a réussi) ---
            <div className="text-center">
              <EnvelopeFill size={48} className="text-success mb-3" />
              <h3 className="fw-bold">Vérifiez vos emails</h3>
              <p className="text-muted">
                {message || "Si un compte est associé à cet email, vous y recevrez un lien pour réinitialiser votre mot de passe."}
              </p>
              <div className="mt-4">
                <Link to="/login" className="btn btn-outline-primary">
                  Retour à la connexion
                </Link>
              </div>
            </div>
          ) : (
            // --- Vue Formulaire (état initial) ---
            <>
              <div className="text-center mb-4">
                <Image src={logo} alt="Logo" width={70} className="mb-3" />
                <h3 className="fw-bold mb-2">Mot de Passe Oublié ?</h3>
                <p className="text-muted">
                  Saisissez votre email et nous vous enverrons les instructions.
                </p>
              </div>

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Adresse Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
                    <Form.Control
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemple@domaine.com"
                      required
                      autoFocus
                      disabled={isLoading}
                    />
                  </InputGroup>
                </Form.Group>

                <div className="d-grid mt-4">
                  <Button variant="primary" type="submit" disabled={isLoading} size="lg">
                    {isLoading ? <Loader size="sm" /> : 'Envoyer le lien'}
                  </Button>
                </div>
              </Form>

              <div className="mt-4 text-center">
                <small>
                  <Link to="/login">Retour à la page de connexion</Link>
                </small>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;