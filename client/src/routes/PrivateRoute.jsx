// client/src/routes/PrivateRoute.jsx
// ==============================================================================
//           Composant de Route Protégée (PrivateRoute)
//
// Ce composant "enveloppe" les routes qui nécessitent que l'utilisateur
// soit authentifié.
//
// - Si l'utilisateur est authentifié, il affiche le contenu de la route
//   demandée (via le composant `<Outlet>`).
// - Si l'utilisateur n'est pas authentifié, il le redirige vers la page
//   de connexion, en sauvegardant la page d'origine pour une redirection
//   future après une connexion réussie.
// ==============================================================================

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Notre hook d'authentification

const PrivateRoute = () => {
  const { isAuthenticated } = useAuth(); // Utilise notre hook pour vérifier l'état
  const location = useLocation();

  // Si l'utilisateur est bien authentifié, on affiche le composant enfant
  // que cette route protège (ex: la page Dashboard).
  // `<Outlet />` est le placeholder de React Router pour le composant enfant.
  if (isAuthenticated) {
    return <Outlet />;
  }

  // Si l'utilisateur n'est pas authentifié, on le redirige vers la page de connexion.
  // On utilise `replace` pour ne pas ajouter la page protégée à l'historique de navigation.
  // On passe l'URL d'origine (`location.pathname`) dans l'état de la redirection,
  // pour que la page de connexion puisse rediriger l'utilisateur vers sa page
  // de destination initiale après une connexion réussie.
  return <Navigate to="/login" state={{ from: location }} replace />;
};

export default PrivateRoute;