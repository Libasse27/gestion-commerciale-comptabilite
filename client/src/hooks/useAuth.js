// ==============================================================================
//                  Hook Personnalisé : useAuth
//
// Ce hook agit comme une "façade" pour le slice d'authentification de Redux.
// Il fournit un accès simple et centralisé à l'état d'authentification
// (utilisateur, token, état de chargement) et à des valeurs dérivées
// pratiques comme `isAuthenticated`.
//
// Cela permet aux composants de consommer l'état d'auth sans connaître
// la structure interne du store Redux.
// ==============================================================================

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook personnalisé pour accéder facilement à l'état d'authentification.
 * @returns {{
 *  user: object | null,
 *  token: string | null,
 *  status: ('idle'|'loading'|'succeeded'|'failed'),
 *  isAuthenticated: boolean,
 *  isLoading: boolean,
 *  isSuccess: boolean,
 *  isError: boolean,
 *  message: string,
 *  permissions: Set<string>
 * }} Un objet contenant l'état d'authentification complet.
 */
export const useAuth = () => {
  // Sélectionne le slice 'auth' entier depuis le store Redux.
  const { user, token, status, isSuccess, isError, message } = useSelector(
    (state) => state.auth
  );

  // `useMemo` est utilisé pour optimiser les re-rendus.
  // L'objet retourné ne changera de référence que si une de ses
  // dépendances (dans le tableau de dépendances) a réellement changé.
  return useMemo(
    () => ({
      user,
      token,
      status: status || 'idle', // Fournit 'idle' par défaut
      isSuccess,
      isError,
      message,
      // Les permissions sont stockées dans l'objet user, on les expose ici
      // sous forme de Set pour des vérifications rapides (O(1)).
      permissions: new Set(user?.permissions || []),

      // --- Valeurs dérivées pour la simplicité d'utilisation ---
      isLoading: status === 'loading',
      // `isAuthenticated` est vrai uniquement si on a un user et un token.
      isAuthenticated: !!user && !!token,
    }),
    [user, token, status, isSuccess, isError, message]
  );
};