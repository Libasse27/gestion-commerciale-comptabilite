import React, { useState, useEffect, useMemo, createContext, useContext } from 'react';
import { io } from 'socket.io-client';
import { useSelector } from 'react-redux';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const token = useSelector((state) => state.auth.token);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!token) {
      // Token absent → déconnexion du socket existant
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Si un socket existe déjà avec le bon token, ne pas le recréer
    if (socket && socket.auth?.token === token) return;

    // Créer un nouveau socket avec le token JWT
    const newSocket = io(SOCKET_URL, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 20000,
    });

    setSocket(newSocket);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connecté :', newSocket.id);
    });

    newSocket.on('disconnect', (reason) => {
      console.warn('❌ Socket déconnecté :', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('⚠️ Erreur de connexion WebSocket :', err.message);
    });

    // Nettoyage
    return () => {
      newSocket.disconnect();
      setIsConnected(false);
    };
  }, [token]);

  const contextValue = useMemo(() => ({ socket, isConnected }), [socket, isConnected]);

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
