// ==============================================================================
//           Middleware de Configuration CORS (Cross-Origin Resource Sharing)
//
// Ce module configure la politique CORS de l'application. CORS est un mécanisme
// de sécurité qui permet ou restreint les requêtes initiées depuis un domaine
// (ou "origine") différent de celui du serveur.
// ==============================================================================

const cors = require('cors');
const AppError = require('../utils/appError');

// Récupérer les URL depuis les variables d'environnement, séparées par une virgule.
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');

/**
 * Options de configuration pour le middleware CORS.
 */
const corsOptions = {
  /**
   * La fonction `origin` détermine si une requête doit être autorisée.
   */
  origin: (origin, callback) => {
    // En développement, on peut autoriser les requêtes sans origine (ex: Postman)
    if (process.env.NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }

    // Si l'origine de la requête est incluse dans notre liste blanche, on autorise.
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Sinon, on rejette la requête avec une erreur.
      callback(new AppError('Accès non autorisé par la politique CORS.', 403));
    }
  },

  methods: 'GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS',
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',
  credentials: true, // Essentiel pour les cookies (comme notre refreshToken)
  optionsSuccessStatus: 204,
};

const configuredCors = cors(corsOptions);

module.exports = configuredCors;