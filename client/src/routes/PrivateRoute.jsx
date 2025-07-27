// ==============================================================================
//           Composant de Route Protégée (PrivateRoute)
//
// Ce composant est un "wrapper" autour des routes qui nécessitent une
// authentification. Il agit comme un gardien.
//
// Il utilise notre hook personnalisé `useAuth` pour obtenir l'état
// d'authentification, ce qui le découple de la structure interne de Redux.
//
// - Si l'utilisateur est authentifié, il rend le composant enfant via `<Outlet />`.
// - Sinon, il le redirige vers la page de connexion.
// ==============================================================================

import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

// Importation du hook personnalisé
import { useAuth } from '../hooks/useAuth';

// Importation des composants UI
import Loader from '../components/common/Loader';

/**
 * Un composant qui rend ses enfants uniquement si l'utilisateur est authentifié.
 * Sinon, il redirige vers la page de connexion.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} [props.redirectTo='/login'] - La page vers laquelle rediriger si l'utilisateur n'est pas connecté.
 */
const PrivateRoute = ({ redirectTo = '/login' }) => {
  // 1. Utiliser le hook `useAuth` pour obtenir l'état d'authentification.
  // C'est plus propre et plus déclaratif que `useSelector`.
  const { isAuthenticated, isLoading } = useAuth();

  // 2. Afficher un loader pendant la vérification initiale de l'état.
  // `isLoading` peut être `true` au démarrage de l'app si vous avez une
  // logique asynchrone pour valider un token existant, par exemple.
  if (isLoading) {
    return <Loader fullscreen text="Vérification de l'authentification..." />;
  }

  // 3. Si l'utilisateur est authentifié, on affiche le contenu de la route.
  // `<Outlet />` est le placeholder de react-router-dom pour le composant enfant.
  if (isAuthenticated) {
    return <Outlet />;
  }

  // 4. Si l'utilisateur n'est pas authentifié, on le redirige.
  // L'option `replace` est importante pour une meilleure UX (pas de "retour" possible vers la page protégée).
  return <Navigate to={redirectTo} replace />;
};

export default PrivateRoute;