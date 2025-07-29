// ==============================================================================
//           Composant d'Aiguillage Racine (Root)
//
// Ce composant est le point d'entrée pour la route racine (`/`).
// Son unique responsabilité est d'agir comme un aiguilleur :
//
//   - Il vérifie l'état d'authentification de l'utilisateur via le hook `useAuth`.
//   - Si l'utilisateur est authentifié, il le redirige vers le tableau de bord.
//   - Si l'utilisateur n'est pas authentifié, il le redirige vers la page de connexion.
//
// Cette approche permet d'effectuer la redirection initiale en une seule étape,
// ce qui est plus performant et évite le message de "throttling" du navigateur.
// ==============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const Root = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Pendant que l'on vérifie l'état d'authentification au premier chargement,
  // afficher un loader pour éviter tout flash de contenu.
  if (isLoading) {
    return <Loader fullscreen text="Chargement de l'application..." />;
  }

  // Effectuer la redirection en fonction de l'état d'authentification.
  // L'option `replace` est cruciale pour que l'utilisateur ne puisse pas
  // revenir à cette page d'aiguillage avec le bouton "précédent".
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

export default Root;