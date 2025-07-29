// ==============================================================================
//           Composant de Route Publique Restreinte
//
// Ce composant est conçu pour les routes qui ne devraient être accessibles
// qu'aux utilisateurs NON authentifiés (ex: page de connexion, d'inscription).
//
// Son fonctionnement est l'inverse du `PrivateRoute` :
//   1. Il vérifie l'état d'authentification de l'utilisateur.
//   2. Si l'utilisateur est authentifié, il le redirige vers une page
//      par défaut (comme le tableau de bord) pour l'empêcher de revoir
//      la page de connexion.
//   3. Si l'utilisateur n'est pas authentifié, il rend le composant enfant
//      (la page publique, ex: `<LoginPage />`).
// ==============================================================================

import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

/**
 * Un composant qui rend ses enfants uniquement si l'utilisateur N'EST PAS authentifié.
 * Sinon, il redirige vers une page principale de l'application.
 *
 * @param {object} props - Les propriétés du composant.
 * @param {string} [props.redirectTo='/dashboard'] - La page vers laquelle rediriger si l'utilisateur est déjà connecté.
 */
const PublicRoute = ({ redirectTo = '/' }) => {
  // On lit l'état d'authentification depuis le store Redux.
  const { token } = useSelector((state) => state.auth);

  // Si l'utilisateur est connecté (le token existe), on le redirige.
  if (token) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si l'utilisateur n'est pas connecté, on affiche la page demandée
  // (ex: le formulaire de connexion).
  return <Outlet />;
};

export default PublicRoute;