// ==============================================================================
//                  Hook et Provider pour Socket.IO
//
// Ce module fournit une architecture complète pour gérer une connexion
// Socket.IO unique et persistante à travers l'application React.
//
// - SocketProvider : Un composant à placer à la racine de l'application.
//   Il gère l'établissement, l'authentification et la fermeture de la connexion.
// - useSocket : Un hook pour accéder à l'instance du socket et à son état.
// - useSocketEvent : Un hook d'aide pour s'abonner à des événements
//   en toute sécurité, avec un nettoyage automatique.
// ==============================================================================

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getFromLocalStorage } from '../utils/helpers'; // Pour récupérer le token
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

// L'URL de votre serveur backend
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

// 1. Création du Contexte React
const SocketContext = createContext();

/**
 * Le Provider qui va gérer la connexion Socket.IO.
 * Enroulez votre composant App principal avec ce Provider.
 * @param {object} props
 * @param {React.ReactNode} props.children Les composants enfants
 */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const userInfo = getFromLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO); // Simule un hook d'auth

  useEffect(() => {
    // On ne tente de se connecter que si l'utilisateur est authentifié
    if (userInfo && userInfo.token) {
      // Établir la connexion avec le token d'authentification
      const newSocket = io(SOCKET_URL, {
        auth: {
          token: userInfo.token,
        },
        // reconnect: true, // activé par défaut
      });

      setSocket(newSocket);

      // Listeners pour les événements de base de la connexion
      newSocket.on('connect', () => {
        setIsConnected(true);
        console.log('✅ Connecté au serveur WebSocket');
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
        console.log('❌ Déconnecté du serveur WebSocket');
      });

      // Gestion des erreurs de connexion (ex: token invalide)
      newSocket.on('connect_error', (err) => {
        console.error('Erreur de connexion WebSocket:', err.message);
      });

      // Fonction de nettoyage pour fermer la connexion lorsque le Provider est démonté
      // ou lorsque l'utilisateur se déconnecte (changement de userInfo.token)
      return () => {
        newSocket.disconnect();
      };
    }
  }, [userInfo?.token]); // Se reconnecte si le token de l'utilisateur change

  const contextValue = { socket, isConnected };

  return (
    <SocketContext.Provider value={contextValue}>
      {children}
    </SocketContext.Provider>
  );
};

/**
 * Hook personnalisé pour accéder à l'instance du socket et à son état de connexion.
 * Doit être utilisé à l'intérieur d'un <SocketProvider>.
 * @returns {{socket: import('socket.io-client').Socket | null, isConnected: boolean}}
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket doit être utilisé à l\'intérieur d\'un SocketProvider');
  }
  return context;
};


/**
 * Hook d'aide pour s'abonner à un événement Socket.IO.
 * Gère automatiquement le nettoyage de l'écouteur.
 * @param {string} eventName - Le nom de l'événement à écouter.
 * @param {(...args: any[]) => void} handler - La fonction à exécuter lorsque l'événement est reçu.
 */
export const useSocketEvent = (eventName, handler) => {
    const { socket } = useSocket();

    useEffect(() => {
        if (socket) {
            socket.on(eventName, handler);

            return () => {
                socket.off(eventName, handler);
            };
        }
    }, [socket, eventName, handler]);
};