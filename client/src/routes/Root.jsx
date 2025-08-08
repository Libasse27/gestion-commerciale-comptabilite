// client/src/routes/Root.jsx
// ==============================================================================
//           Composant Racine de l'Application (Root)
//
// Ce composant sert de point d'entrée pour le rendu de toutes les routes.
// C'est la coquille la plus externe de notre application après les providers.
// ==============================================================================

import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

const Root = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Si l'utilisateur est sur la page racine "/", on le redirige.
  if (location.pathname === '/') {
    return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
  }
  
  // Pour toutes les autres routes, on laisse React Router décider
  // en affichant la route enfant correspondante.
  return <Outlet />;
};

export default Root;