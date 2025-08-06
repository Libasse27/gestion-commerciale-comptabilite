// client/src/pages/auth/ForgotPassword.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Card, Form, Button, InputGroup, Image } from 'react-bootstrap';
import { EnvelopeFill } from 'react-bootstrap-icons';

import { useAuth } from '../../hooks/useAuth';
import { requestPasswordReset, reset } from '../../store/slices/authSlice';
import { useNotification } from '../../context/NotificationContext';
import { TOAST_TYPES } from '../../utils/constants';
import Loader from '../../components/common/Loader';
import logo from '../../assets/images/logo.webp';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const dispatch = useDispatch();
  const { addNotification } = useNotification();
  const { status, message } = useAuth();

  const isLoading = status === 'loading';
  const isSuccess = status === 'succeeded';

  useEffect(() => {
    if (status === 'failed') {
      addNotification(message || 'Une erreur est survenue.', TOAST_TYPES.ERROR);
    }
    
    // Nettoyer l'état en quittant le composant
    return () => {
      dispatch(reset());
    };
  }, [status, message, dispatch, addNotification]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      return addNotification('Veuillez saisir votre adresse email.', TOAST_TYPES.WARNING);
    }
    dispatch(requestPasswordReset(email));
  };

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 bg-light">
      <Card style={{ width: '450px' }} className="shadow-lg">
        <Card.Body className="p-4 p-sm-5">
          {isSuccess ? (
            <div className="text-center">
              <EnvelopeFill size={48} className="text-success mb-3" />
              <h3 className="fw-bold">Vérifiez vos emails</h3>
              <p className="text-muted">{message || "Si un compte est associé à cet email, vous y recevrez un lien pour réinitialiser votre mot de passe."}</p>
              <div className="mt-4">
                <Link to="/login" className="btn btn-outline-primary">Retour à la connexion</Link>
              </div>
            </div>
          ) : (
            <>
              <div className="text-center mb-4">
                <Image src={logo} alt="Logo" width={70} className="mb-3" />
                <h3 className="fw-bold mb-2">Mot de Passe Oublié ?</h3>
                <p className="text-muted">Saisissez votre email et nous vous enverrons les instructions.</p>
              </div>

              <Form onSubmit={handleSubmit} noValidate>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Adresse Email</Form.Label>
                  <InputGroup>
                    <InputGroup.Text><EnvelopeFill /></InputGroup.Text>
                    <Form.Control type="email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="exemple@domaine.com" required autoFocus disabled={isLoading} />
                  </InputGroup>
                </Form.Group>

                <div className="d-grid mt-4">
                  <Button variant="primary" type="submit" disabled={isLoading} size="lg">
                    {isLoading ? <Loader size="sm" /> : 'Envoyer le lien'}
                  </Button>
                </div>
              </Form>

              <div className="mt-4 text-center">
                <small><Link to="/login">Retour à la page de connexion</Link></small>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;