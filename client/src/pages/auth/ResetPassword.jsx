// ==============================================================================
//           Page de Réinitialisation de Mot de Passe
//
// Ce composant affiche un formulaire où l'utilisateur peut saisir son
// nouveau mot de passe, après avoir cliqué sur le lien reçu par email.
//
// Il extrait le token de réinitialisation depuis l'URL.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { Container, Card, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { LockFill, CheckCircleFill } from 'react-bootstrap-icons';

import { useAuth } from '../../hooks/useAuth';
import { resetPassword, reset } from '../../store/slices/authSlice';
import { isStrongPassword } from '../../utils/validators';
import FormField from '../../components/forms/FormField';
import Loader from '../../components/common/Loader';

const ResetPasswordPage = () => {
  const [formData, setFormData] = useState({
    password: '',
    passwordConfirm: '',
  });
  const { password, passwordConfirm } = formData;
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // `useParams` est un hook de react-router-dom pour lire les paramètres de l'URL
  const { token } = useParams();
  
  const { isLoading, isError, isSuccess, message } = useAuth();

  useEffect(() => {
    if (isError) {
      toast.error(message || "Le lien de réinitialisation est invalide ou a expiré.");
      // Optionnel : rediriger si le token est clairement invalide
      // navigate('/login');
    }
    
    // Laisser le message de succès être géré par l'affichage conditionnel
    
    return () => {
      dispatch(reset());
    };
  }, [isError, message, dispatch]);

  const handleChange = (e) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      return toast.error('Les mots de passe ne correspondent pas.');
    }
    const passwordError = isStrongPassword(password);
    if (passwordError) {
        return toast.error(passwordError);
    }
    
    dispatch(resetPassword({ token, password }));
  };
  
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" style={{ backgroundColor: 'var(--bs-light)' }}>
      <Card style={{ width: '450px' }} className="p-3 shadow-lg border-0">
        <Card.Body>
          {isSuccess ? (
            // --- Vue de Succès ---
            <div className="text-center">
              <CheckCircleFill size={48} className="text-success mb-3" />
              <h3 className="fw-bold">Mot de Passe Réinitialisé !</h3>
              <p className="text-muted">{message || "Votre mot de passe a été mis à jour avec succès."}</p>
              <Button as={Link} to="/login" variant="primary">
                Aller à la page de connexion
              </Button>
            </div>
          ) : (
            // --- Vue Formulaire ---
            <>
              <div className="text-center mb-4">
                <h3 className="fw-bold mb-3">Choisissez un Nouveau Mot de Passe</h3>
                <p className="text-muted">Veuillez saisir votre nouveau mot de passe.</p>
              </div>

              <Form onSubmit={handleSubmit} noValidate>
                <FormField
                  label="Nouveau mot de passe"
                  type="password"
                  name="password"
                  value={password}
                  onChange={handleChange}
                  icon={<LockFill />}
                  disabled={isLoading}
                  required
                />
                <FormField
                  label="Confirmer le nouveau mot de passe"
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
                      <Loader size="sm" showText={true} text="Enregistrement..." variant="light" />
                    ) : (
                      'Réinitialiser le mot de passe'
                    )}
                  </Button>
                </div>
              </Form>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;