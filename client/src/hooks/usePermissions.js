// client/src/hooks/usePermissions.js
// ==============================================================================
//           Hook Personnalisé pour la Vérification des Permissions
//
// Fournit une API sémantique pour la vérification des permissions dans les
// composants en s'appuyant sur le hook `useAuth`.
// ==============================================================================

import { useAuth } from './useAuth';
import { useCallback } from 'react';

/**
 * Hook pour vérifier facilement les permissions de l'utilisateur connecté.
 * @returns {{
 *  permissions: Set<string>,
 *  hasPermission: (permission: string) => boolean,
 *  hasAnyPermission: (permissions: string[]) => boolean
 * }}
 */
export const usePermissions = () => {
  const { permissions } = useAuth();

  /**
   * Vérifie si l'utilisateur possède une permission spécifique.
   * @param {string | undefined} requiredPermission
   * @returns {boolean}
   */
  const hasPermission = useCallback(
    (requiredPermission) => {
      if (!requiredPermission) return true;
      return permissions.has(requiredPermission);
    },
    [permissions]
  );
  
  /**
   * Vérifie si l'utilisateur possède au moins une des permissions listées.
   * @param {string[]} [requiredPermissions=[]]
   * @returns {boolean}
   */
  const hasAnyPermission = useCallback(
    (requiredPermissions = []) => {
      if (requiredPermissions.length === 0) return true;
      return requiredPermissions.some(p => permissions.has(p));
    },
    [permissions]
  );

  return { permissions, hasPermission, hasAnyPermission };
};