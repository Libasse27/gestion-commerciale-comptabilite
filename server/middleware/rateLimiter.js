// server/middleware/rateLimiter.js
// ==============================================================================
//           Middleware de Limitation de Taux (Rate Limiting)
//
// Ce module configure différents "rate limiters" pour protéger l'API contre
// les abus, comme les attaques DoS ou les tentatives de brute-force.
// ==============================================================================

const rateLimit = require('express-rate-limit');

/**
 * Options communes à tous les limiters.
 */
const commonOptions = {
  standardHeaders: true, // Envoie les en-têtes `RateLimit-*` standards
  legacyHeaders: false,  // Désactive les anciens en-têtes `X-RateLimit-*`
  // Pour un déploiement en production avec plusieurs serveurs (scaling),
  // il faudrait utiliser un store partagé comme Redis :
  // store: new RateLimitRedis({ sendCommand: (...args) => redisClient.sendCommand(args) }),
};

/**
 * Limiteur général pour la plupart des routes de l'API.
 */
const apiLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  message: {
    status: 'fail',
    message: 'Trop de requêtes envoyées depuis cette IP, veuillez réessayer après 15 minutes.',
  },
});

/**
 * Limiteur plus strict pour les routes d'authentification sensibles.
 */
const authLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: {
    status: 'fail',
    message: "Trop de tentatives d'authentification depuis cette IP. Pour des raisons de sécurité, l'accès est bloqué temporairement.",
  },
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies dans la limite
});


/**
 * Limiteur très strict pour les opérations coûteuses.
 */
const sensitiveOperationLimiter = rateLimit({
    ...commonOptions,
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 5,
    message: {
        status: 'fail',
        message: 'Vous avez atteint la limite pour cette opération. Veuillez réessayer dans une heure.'
    }
});


module.exports = {
  apiLimiter,
  authLimiter,
  sensitiveOperationLimiter,
};