// ==============================================================================
//                  Hook Personnalisé : useAuth
//
// Ce hook est une façade ("facade") qui simplifie l'accès à l'état
// d'authentification stocké dans le store Redux.
//
// Au lieu d'utiliser `useSelector` dans chaque composant pour extraire les
// différentes parties du slice `auth`, les composants peuvent simplement
// appeler `useAuth()` pour obtenir un objet clair avec toutes les
// informations nécessaires.
//
// Avantages :
//   - Simplifie le code des composants.
//   - Découple les composants de la structure interne du store Redux.
//   - Centralise la logique de sélection de l'état d'authentification.
// ==============================================================================

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook personnalisé pour accéder facilement à l'état d'authentification.
 * @returns {{
 *  user: object | null,
 *  token: string | null,
 *  isAuthenticated: boolean,
 *  isLoading: boolean,
 *  isError: boolean,
 *  isSuccess: boolean,
 *  message: string
 * }} Un objet contenant l'état d'authentification.
 */
export const useAuth = () => {
  // Sélectionne le slice 'auth' entier depuis le store Redux.
  const { user, token, isLoading, isError, isSuccess, message } = useSelector(
    (state) => state.auth
  );

  // `useMemo` est utilisé ici comme une optimisation.
  // Il s'assure que l'objet retourné par le hook ne change de référence
  // que si l'une de ses valeurs a réellement changé. Cela peut éviter
  // des re-rendus inutiles dans les composants qui consomment ce hook.
  return useMemo(
    () => ({
      user,
      token,
      isLoading,
      isError,
      isSuccess,
      message,
      // On peut ajouter ici des valeurs dérivées pratiques.
      isAuthenticated: !!user && !!token,
    }),
    [user, token, isLoading, isError, isSuccess, message]
  );
};