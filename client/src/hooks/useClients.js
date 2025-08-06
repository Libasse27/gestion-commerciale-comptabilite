// client/src/hooks/useClients.js
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

export const useClients = () => {
  const { clients, clientCourant, pagination, status, message } = useSelector(
    (state) => state.clients
  );

  return useMemo(
    () => ({
      clients,
      selectedClient: clientCourant, // Renommé pour la clarté
      pagination,
      status,
      message,
      isLoading: status === 'loading',
      isSuccess: status === 'succeeded',
      isError: status === 'failed',
    }),
    [clients, clientCourant, pagination, status, message]
  );
};