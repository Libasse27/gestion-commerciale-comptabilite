// client/src/hooks/useAuth.js
// ==============================================================================
//                  Hook Personnalisé : useAuth
//
// Agit comme une "façade" pour le slice d'authentification de Redux,
// fournissant un accès simple et centralisé à l'état d'authentification
// et à des valeurs dérivées pratiques.
// ==============================================================================

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook personnalisé pour accéder facilement à l'état d'authentification.
 */
export const useAuth = () => {
  const { user, token, status, message } = useSelector((state) => state.auth);

  return useMemo(
    () => ({
      user,
      token,
      status: status || 'idle',
      message,
      // Les permissions sont dans l'objet user, on les expose ici sous forme de Set
      // pour des vérifications de droits rapides et performantes (O(1)).
      permissions: new Set(user?.permissions || []),

      // --- Valeurs dérivées pour la simplicité d'utilisation ---
      isLoading: status === 'loading',
      isAuthenticated: !!user && !!token,
    }),
    [user, token, status, message]
  );
};