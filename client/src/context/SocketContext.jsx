// ==============================================================================
//           Contexte, Provider et Hooks pour la Gestion de Socket.IO
//
// Ce module fournit une architecture complète pour gérer une connexion
// Socket.IO unique et persistante à travers l'application React.
//
// - SocketContext : Le contexte React lui-même.
// - SocketProvider : Le composant qui gère le cycle de vie de la connexion.
// - useSocket : Le hook pour accéder à l'instance du socket et à son état.
// - useSocketEvent : Le hook d'aide pour s'abonner aux événements.
// ==============================================================================

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useContext,
  createContext
} from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

// L'URL de votre serveur backend
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// 1. Création du Contexte React
const SocketContext = createContext(null);

/**
 * Le Provider qui va gérer la connexion Socket.IO.
 * Enroulez votre composant App principal avec ce Provider.
 * @param {{children: React.ReactNode}} props
 */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  // Récupération du token via Redux
  const token = useSelector((state) => state.auth.token);

  useEffect(() => {
    if (token) {
      const newSocket = io(SOCKET_URL, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: 5,
      });

      setSocket(newSocket);

      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log(`✅ Connecté au serveur WebSocket avec l'ID: ${newSocket.id}`);
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Déconnecté du serveur WebSocket');
      });

      newSocket.on('connect_error', (err) => {
        console.error('Erreur de connexion WebSocket:', err.message);
      });

      return () => {
        newSocket.disconnect();
      };
    } else if (socket) {
      socket.disconnect();
      setSocket(null);
      setIsConnected(false);
    }
  }, [token]);

  const contextValue = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook personnalisé pour accéder à l'instance du socket et à son état de connexion.
 * @returns {{socket: import('socket.io-client').Socket | null, isConnected: boolean}}
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket doit être utilisé à l'intérieur d'un <SocketProvider>");
  }
  return context;
};

/**
 * Hook d'aide pour s'abonner à un événement Socket.IO en toute sécurité.
 * Gère automatiquement l'abonnement et le désabonnement.
 * @param {string} eventName
 * @param {(...args: any[]) => void} handler
 */
export const useSocketEvent = (eventName, handler) => {
  const { socket } = useSocket();
  const memoizedHandler = useCallback(handler, [handler]);

  useEffect(() => {
    if (!socket) return;

    socket.on(eventName, memoizedHandler);
    return () => socket.off(eventName, memoizedHandler);
  }, [socket, eventName, memoizedHandler]);
};
