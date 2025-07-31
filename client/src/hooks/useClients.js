// ==============================================================================
//                  Hook Personnalisé : useClients
//
// Ce hook est une façade ("facade") qui simplifie l'accès à l'état du
// "slice" des clients, stocké dans le store Redux.
//
// Les composants peuvent appeler `useClients()` pour obtenir un objet clair
// avec toutes les informations nécessaires (la liste, le client sélectionné,
// les états de chargement, etc.), sans avoir à connaître la structure
// interne du store.
// ==============================================================================

import { useMemo } from 'react';
import { useSelector } from 'react-redux';

/**
 * Hook personnalisé pour accéder facilement à l'état du slice "clients".
 *
 * @returns {{
 *  clients: Array<object>,
 *  selectedClient: object | null,
 *  pagination: object,
 *  isLoading: boolean,
 *  isError: boolean,
 *  message: string
 * }} Un objet contenant l'état complet du slice clients.
 */
export const useClients = () => {
  // 1. Sélectionne le slice 'clients' entier depuis le store Redux.
  const {
    items,
    selectedClient,
    pagination,
    isLoading,
    isError,
    message,
  } = useSelector((state) => state.clients);

  // 2. `useMemo` est utilisé pour optimiser.
  // Il garantit que l'objet retourné par le hook ne change de référence
  // que si l'une de ses valeurs a réellement changé. Cela peut éviter
  // des re-rendus inutiles dans les composants qui consomment ce hook.
  return useMemo(
    () => ({
      clients: items, // On renomme `items` en `clients` pour plus de clarté
      selectedClient,
      pagination,
      isLoading,
      isError,
      message,
    }),
    [items, selectedClient, pagination, isLoading, isError, message]
  );
};