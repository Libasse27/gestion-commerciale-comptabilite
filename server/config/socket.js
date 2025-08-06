// ==============================================================================
//                Configuration du Serveur Socket.IO (Temps Réel)
//
// Ce module initialise et gère le serveur Socket.IO. Il inclut :
//
// - Une liaison avec le serveur HTTP d'Express.
// - La gestion du CORS pour autoriser les connexions depuis le client.
// - Un middleware d'authentification par JWT pour sécuriser les connexions.
// - Une logique de "rooms" pour envoyer des notifications ciblées à des
//   utilisateurs spécifiques.
// ==============================================================================

const { Server } = require('socket.io');
const { logger } = require('../middleware/logger');
const { verifyAccessToken } = require('./jwt');
const User = require('../models/auth/User');

let io;

/**
 * Initialise le serveur Socket.IO et l'attache au serveur HTTP.
 * @param {http.Server} httpServer - L'instance du serveur HTTP créée par Express.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN,
      methods: ['GET', 'POST'],
    },
    pingTimeout: 30000, // ⏱ Déconnecte après 30s sans réponse
    pingInterval: 10000, // ⏱ Ping toutes les 10s
  });

  // --- Middleware d'Authentification pour Socket.IO ---
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        return next(new Error('Authentication error: Token manquant.'));
      }

      const decoded = verifyAccessToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication error: Token invalide ou expiré.'));
      }

      const user = await User.findById(decoded.id).select('firstName lastName email isActive');
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Utilisateur non trouvé ou inactif.'));
      }

      socket.user = user; // ✅ Attache l'utilisateur réel à la socket
      next();
    } catch (error) {
      logger.error("Erreur d'authentification Socket:", { error });
      next(new Error('Authentication error'));
    }
  });

  // --- Gestion des Événements de Connexion ---
  io.on('connection', (socket) => {
    logger.info(`✅ Utilisateur connecté via WebSocket: ${socket.user.firstName} (ID de socket: ${socket.id})`);

    const userRoom = socket.user._id.toString();
    socket.join(userRoom);
    logger.info(`   > ${socket.user.firstName} a rejoint la room privée: ${userRoom}`);

    socket.on('disconnect', () => {
      logger.info(`❌ Utilisateur déconnecté: ${socket.user.firstName} (ID de socket: ${socket.id})`);
    });
  });

  logger.info('📡 Serveur Socket.IO initialisé et en attente de connexions.');
  return io;
};

/**
 * Récupère l'instance de Socket.IO initialisée pour l'utiliser ailleurs dans l'app.
 * @returns {Server} L'instance du serveur IO.
 */
const getIO = () => {
  if (!io) {
    throw new Error("Socket.io n'est pas initialisé ! Appelez d'abord initSocket.");
  }
  return io;
};

module.exports = {
  initSocket,
  getIO,
};
