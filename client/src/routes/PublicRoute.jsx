// ==============================================================================
//           Composant de Route Publique Restreinte
//
// Ce composant est conçu pour les routes qui ne devraient être accessibles
// qu'aux utilisateurs NON authentifiés (ex: page de connexion, d'inscription).
//
// Son fonctionnement est l'inverse du `PrivateRoute` :
//   1. Il vérifie l'état d'authentification de l'utilisateur via le hook `useAuth`.
//   2. Si l'utilisateur est authentifié, il le redirige vers une page
//      par défaut (comme le tableau de bord).
//   3. Si l'utilisateur n'est pas authentifié, il rend le composant enfant
//      (la page publique, ex: `<LoginPage />`).
// ==============================================================================

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // On utilise notre hook personnalisé
import Loader from '../components/common/Loader';

/**
 * Un composant qui rend ses enfants uniquement si l'utilisateur N'EST PAS authentifié.
 * Sinon, il redirige vers une page principale de l'application.
 *
 * @param {{redirectTo?: string}} props
 */
const PublicRoute = ({ redirectTo = '/dashboard' }) => {
  // Le hook `useAuth` fournit un état clair `isAuthenticated` et `isLoading`.
  const { isAuthenticated, isLoading } = useAuth();

  // Pendant que l'on vérifie l'état d'authentification au premier chargement,
  // on affiche un loader pour éviter d'afficher brièvement la page publique
  // avant de potentiellement rediriger.
  if (isLoading) {
    return <Loader fullscreen text="Chargement de l'application..." />;
  }

  // Si l'utilisateur est connecté, on le redirige loin des pages publiques.
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si l'utilisateur n'est pas connecté, on affiche la page demandée
  // (ex: le formulaire de connexion). `<Outlet />` sera remplacé par le
  // composant enfant de la route (<LoginPage />, <RegisterPage />, etc.).
  return <Outlet />;
};

export default PublicRoute;