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
import { Container, Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { EnvelopeFill } from 'react-bootstrap-icons';

// Importation de nos hooks et actions
import { useAuth } from '../../hooks/useAuth';
import { forgotPassword, reset } from '../../store/slices/authSlice';
import FormField from '../../components/forms/FormField';
import Loader from '../../components/common/Loader';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();

  const { isLoading, isError, isSuccess, message } = useAuth();

  useEffect(() => {
    // Nettoyer l'état en quittant la page
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      toast.warn('Veuillez saisir votre adresse email.');
      return;
    }
    dispatch(forgotPassword(email));
  };
  
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: 'var(--bs-light)' }}>
      <Card style={{ width: '450px' }} className="p-3 shadow-lg border-0">
        <Card.Body>
          {isSuccess ? (
            // --- Vue de Confirmation ---
            <div className="text-center">
              <EnvelopeFill size={48} className="text-success mb-3" />
              <h3 className="fw-bold">Vérifiez vos emails</h3>
              <p className="text-muted">{message || "Si un compte est associé à cet email, vous recevrez un lien pour réinitialiser votre mot de passe."}</p>
              <Link to="/login">Retour à la connexion</Link>
            </div>
          ) : (
            // --- Vue Formulaire ---
            <>
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-3">Mot de Passe Oublié ?</h3>
                <p className="text-muted">Pas de panique. Saisissez votre email et nous vous enverrons un lien pour le réinitialiser.</p>
              </div>

              <Form onSubmit={handleSubmit} noValidate>
                <FormField
                  label="Adresse Email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={<EnvelopeFill />}
                  disabled={isLoading}
                  required
                />
                <div className="d-grid mt-4">
                  <Button variant="primary" type="submit" disabled={isLoading} size="lg">
                    {isLoading ? (
                      <Loader size="sm" showText={true} text="Envoi en cours..." variant="light" />
                    ) : (
                      'Envoyer le lien'
                    )}
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