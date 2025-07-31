// ==============================================================================
//           Composant d'Aiguillage Racine (Root)
//
// MISE À JOUR : Utilise maintenant l'état `status` de l'authentification pour
// une gestion fiable du chargement initial, sans état local ni useEffect.
// ==============================================================================

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/common/Loader';

const Root = () => {
  // 1. On récupère l'état d'authentification complet via notre hook.
  // `status` peut être 'idle', 'loading', 'succeeded', ou 'failed'.
  const { isAuthenticated, status } = useAuth();

  // 2. Tant que le statut est indéterminé ('idle') ou en cours de chargement ('loading'),
  // on affiche un loader. Cela empêche toute redirection prématurée avant
  // que l'état d'authentification initial ne soit connu.
  if (status === 'idle' || status === 'loading') {
    return <Loader fullscreen text="Chargement de l'application..." />;
  }

  // 3. Une fois le statut connu, on redirige en toute sécurité.
  // L'option `replace` est cruciale pour que l'utilisateur ne puisse pas
  // revenir à cette page d'aiguillage avec le bouton "précédent".
  return <Navigate to={isAuthenticated ? '/dashboard' : '/login'} replace />;
};

export default Root;