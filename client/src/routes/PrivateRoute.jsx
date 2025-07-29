// ==============================================================================
//           Composant de Route Protégée (PrivateRoute)
//
// MISE À JOUR : Utilise un état `status` ('idle', 'loading', 'succeeded') pour
// prendre des décisions de rendu plus stables et éviter les boucles de
// redirection infinies.
// ==============================================================================

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

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
  // 1. Utiliser le hook `useAuth` pour obtenir l'état d'authentification complet.
  const { isAuthenticated, status } = useAuth();
  const location = useLocation();

  // 2. Pendant que le statut est indéterminé ('idle') ou en cours de chargement ('loading'),
  // on affiche un loader. Cela empêche toute redirection prématurée.
  if (status === 'idle' || status === 'loading') {
    return <Loader fullscreen text="Vérification de l'authentification..." />;
  }

  // 3. Une fois le statut connu ('succeeded' ou 'failed'), on prend une décision.
  // Si l'utilisateur est authentifié, on affiche le contenu de la route.
  if (isAuthenticated) {
    return <Outlet />;
  }

  // 4. Si l'utilisateur n'est pas authentifié, on le redirige.
  // On passe `state={{ from: location }}` pour pouvoir rediriger l'utilisateur
  // vers sa page d'origine après qu'il se soit connecté.
  return <Navigate to={redirectTo} state={{ from: location }} replace />;
};

export default PrivateRoute;