// client/src/routes/PublicRoute.jsx
// ==============================================================================
//           Composant de Route Publique (PublicRoute)
//
// Ce composant "enveloppe" les routes qui ne devraient être accessibles
// qu'aux utilisateurs non authentifiés (ex: pages de connexion, d'inscription).
//
// - Si l'utilisateur n'est pas authentifié, il affiche le contenu de la route.
// - Si l'utilisateur est déjà authentifié, il le redirige automatiquement
//   vers le tableau de bord pour éviter qu'il ne revoie la page de connexion.
// ==============================================================================

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // Notre hook d'authentification

const PublicRoute = () => {
  const { isAuthenticated } = useAuth(); // Utilise notre hook pour vérifier l'état

  // Si l'utilisateur est déjà connecté, on le redirige vers le tableau de bord.
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  // Si l'utilisateur n'est pas connecté, on affiche le composant de la page publique.
  // `<Outlet />` est le placeholder pour la page Login, Register, etc.
  return <Outlet />;
};

export default PublicRoute;