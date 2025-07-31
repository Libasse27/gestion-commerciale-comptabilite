// ==============================================================================
//           Hook Personnalisé pour la Vérification des Permissions
//
// Ce hook est une surcouche simple au hook `useAuth`. Son seul but est de
// fournir une API plus claire et plus sémantique pour la vérification des
// permissions dans les composants.
//
// Il abstrait la logique de " fouiller " dans l'objet `user` pour trouver les
// permissions, rendant les composants plus lisibles.
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
  const { permissions } = useAuth(); // Récupère le Set de permissions depuis useAuth

  /**
   * Vérifie si l'utilisateur possède une permission spécifique.
   */
  const hasPermission = useCallback(
    (requiredPermission) => {
      if (!requiredPermission) return true; // Si aucune permission n'est requise, on autorise
      return permissions.has(requiredPermission);
    },
    [permissions]
  );
  
  /**
   * Vérifie si l'utilisateur possède au moins une des permissions listées.
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