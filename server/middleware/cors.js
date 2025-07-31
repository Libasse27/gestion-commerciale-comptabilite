// ==============================================================================
//           Middleware de Configuration CORS (Cross-Origin Resource Sharing)
//
// Ce module configure la politique CORS de l'application. CORS est un mécanisme
// de sécurité qui permet ou restreint les requêtes initiées depuis un domaine
// (ou "origine") différent de celui du serveur.
//
// La configuration est dynamique en fonction de l'environnement :
//   - En 'development', la liste des origines autorisées peut être plus permissive.
//   - En 'production', seule l'URL de l'application frontend de production
//     devrait être autorisée.
// ==============================================================================

const cors = require('cors');

// --- Liste Blanche des Origines Autorisées ---
// Récupérez les URL depuis les variables d'environnement.
// Cela permet de configurer différentes origines pour le dev, la pré-prod, etc.
// Note: nous utilisons la même variable que pour la config Socket.IO pour la cohérence.
const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',');

/**
 * Options de configuration pour le middleware CORS.
 */
const corsOptions = {
  /**
   * La fonction `origin` détermine si une requête provenant d'une certaine
   * origine doit être autorisée.
   */
  origin: (origin, callback) => {
    // Autoriser les requêtes sans origine (ex: Postman, apps mobiles) en mode dev
    if (process.env.NODE_ENV === 'development' && !origin) {
      return callback(null, true);
    }

    // Si l'origine de la requête est incluse dans notre liste blanche, on autorise.
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // Sinon, on rejette la requête avec une erreur.
      callback(new Error('Accès non autorisé par la politique CORS.'));
    }
  },

  /**
   * Méthodes HTTP autorisées.
   */
  methods: 'GET,POST,PUT,DELETE,PATCH,HEAD,OPTIONS',

  /**
   * En-têtes HTTP que le client est autorisé à envoyer.
   * 'Authorization' est crucial pour les tokens JWT.
   */
  allowedHeaders: 'Origin, X-Requested-With, Content-Type, Accept, Authorization',

  /**
   * Permet au navigateur d'envoyer les cookies et les en-têtes d'autorisation.
   * Essentiel pour l'authentification.
   */
  credentials: true,

  /**
   * Spécifie la réponse pour les requêtes de "preflight" (OPTIONS).
   * Renvoie 204 No Content, une pratique standard.
   */
  optionsSuccessStatus: 204,
};

/**
 * Crée et exporte le middleware CORS configuré.
 */
const configuredCors = cors(corsOptions);

module.exports = configuredCors;