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
const { verifyAccessToken } = require('./jwt'); // Notre utilitaire JWT
const User = require('../models/auth/User');     // Le modèle User pour vérifier l'existence

let io; // Instance de Socket.IO qui sera partagée à travers l'application

/**
 * Initialise le serveur Socket.IO et l'attache au serveur HTTP.
 * @param {http.Server} httpServer - L'instance du serveur HTTP créée par Express.
 */
const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN, // Autorise uniquement le client React
      methods: ['GET', 'POST'],
    },
  });

  // --- Middleware d'Authentification pour Socket.IO ---
  // S'exécute pour chaque nouvelle tentative de connexion WebSocket.
  io.use(async (socket, next) => {
    try {
      // Le token JWT doit être envoyé par le client dans le paquet d'authentification
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication error: Token manquant.'));
      }

      // On utilise notre utilitaire pour vérifier le token
      const decoded = verifyAccessToken(token);
      if (!decoded || !decoded.id) {
        return next(new Error('Authentication error: Token invalide ou expiré.'));
      }

      // Vérifier que l'utilisateur existe toujours et n'est pas inactif
      const user = await User.findById(decoded.id).select('firstName lastName email isActive');
      if (!user || !user.isActive) {
        return next(new Error('Authentication error: Utilisateur non trouvé ou inactif.'));
      }

      // Attacher les informations de l'utilisateur à l'objet socket pour un usage ultérieur
      socket.user = user;
      next();
    } catch (error) {
      console.error("Erreur d'authentification Socket:", error);
      next(new Error('Authentication error'));
    }
  });


  // --- Gestion des Événements de Connexion ---
  io.on('connection', (socket) => {
    console.log(`✅ Utilisateur connecté via WebSocket: ${socket.user.firstName} (ID de socket: ${socket.id})`);

    // Chaque utilisateur rejoint une "room" privée portant son propre ID MongoDB.
    // Cela permet de lui envoyer des notifications de manière ciblée et sécurisée.
    const userRoom = socket.user._id.toString();
    socket.join(userRoom);
    console.log(`   > ${socket.user.firstName} a rejoint la room privée: ${userRoom}`);

    // Gérer la déconnexion
    socket.on('disconnect', () => {
      console.log(`❌ Utilisateur déconnecté: ${socket.user.firstName} (ID de socket: ${socket.id})`);
    });
  });

  console.log('📡 Serveur Socket.IO initialisé et en attente de connexions.');
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