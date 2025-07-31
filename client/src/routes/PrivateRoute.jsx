// ==============================================================================
//           Composant de Route Protégée (PrivateRoute)
//
// Ce composant est un "wrapper" autour des routes qui nécessitent une
// authentification. Il agit comme un gardien.
//
// Son fonctionnement :
//   1. Il utilise le hook `useAuth` pour vérifier l'état d'authentification.
//   2. Si l'utilisateur est authentifié (`isAuthenticated` est vrai), il rend
//      le composant enfant (la page protégée) via `<Outlet>`.
//   3. Si l'utilisateur n'est pas authentifié, il le redirige vers la
//      page de connexion (`/login`).
//
// Il utilise le composant `Navigate` de `react-router-dom` pour la redirection.
// ==============================================================================

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth'; // On utilise notre hook personnalisé
import Loader from '../components/common/Loader';

/**
 * Un composant qui rend ses enfants uniquement si l'utilisateur est authentifié.
 * Sinon, il redirige vers la page de connexion.
 *
 * @param {{redirectTo?: string}} props
 */
const PrivateRoute = ({ redirectTo = '/login' }) => {
  // Le hook `useAuth` nous donne un état clair `isAuthenticated` et `isLoading`.
  // Ce composant n'a plus besoin de connaître la structure interne de Redux (token, etc.).
  const { isAuthenticated, isLoading } = useAuth();

  // Pendant que l'état d'authentification est en cours de vérification
  // (par exemple, au premier chargement de l'application), on affiche un loader.
  // Cela évite un "flash" où l'utilisateur est brièvement redirigé vers /login
  // avant que son état de connexion ne soit confirmé.
  if (isLoading) {
    return <Loader fullscreen text="Vérification de la session..." />;
  }
  
  // Si l'utilisateur est authentifié, on rend la page demandée.
  // `<Outlet />` est un placeholder de react-router-dom qui sera remplacé
  // par le composant enfant de la route (ex: <DashboardPage />).
  if (isAuthenticated) {
    return <Outlet />;
  }

  // Si l'utilisateur n'est pas authentifié, on le redirige.
  // L'option `replace` remplace l'entrée actuelle dans l'historique de navigation,
  // ce qui empêche l'utilisateur de revenir à la page protégée avec le
  // bouton "précédent" du navigateur après avoir été redirigé.
  return <Navigate to={redirectTo} replace />;
};

export default PrivateRoute;