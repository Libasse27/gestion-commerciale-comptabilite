// ==============================================================================
//           Middleware de Limitation de Taux (Rate Limiting)
//
// Ce module configure et exporte différents "rate limiters" en utilisant
// la bibliothèque `express-rate-limit`. Le but est de protéger l'API contre
// les abus, comme les attaques par déni de service (DoS) ou les tentatives
// de brute-force sur les points d'authentification.
//
// Différentes stratégies peuvent être définies pour différentes routes.
// ==============================================================================

const rateLimit = require('express-rate-limit');

/**
 * Options de configuration communes à tous les limiters.
 */
const commonOptions = {
  standardHeaders: true, // Envoie les en-têtes `RateLimit-*` standards
  legacyHeaders: false,  // Désactive les anciens en-têtes `X-RateLimit-*`
  // store: ... // Pour utiliser un store partagé comme Redis dans un environnement multi-serveurs
};

/**
 * Limiteur général pour la plupart des routes de l'API.
 * Vise à prévenir un abus général du service.
 */
const apiLimiter = rateLimit({
  ...commonOptions,
  windowMs: 15 * 60 * 1000, // Fenêtre de 15 minutes
  max: 200, // Limite chaque IP à 200 requêtes par fenêtre de 15 minutes
  message: {
    status: 'error',
    message: 'Trop de requêtes envoyées depuis cette IP, veuillez réessayer après 15 minutes.',
  },
});

/**
 * Limiteur plus strict spécifiquement pour les routes d'authentification.
 * Vise à ralentir les tentatives de brute-force sur les mots de passe.
 */
const authLimiter = rateLimit({
  ...commonOptions,
  windowMs: 10 * 60 * 1000, // Fenêtre de 10 minutes
  max: 10, // Limite chaque IP à 10 tentatives de connexion / réinitialisation par fenêtre
  message: {
    status: 'error',
    message: 'Trop de tentatives d\'authentification. Veuillez réessayer plus tard.',
  },
  skipSuccessfulRequests: true, // Ne pas compter les requêtes réussies (ex: login réussi) dans la limite
});


/**
 * Limiteur très strict pour les opérations sensibles ou coûteuses.
 * Ex: génération de rapports complexes.
 */
const sensitiveOperationLimiter = rateLimit({
    ...commonOptions,
    windowMs: 60 * 60 * 1000, // Fenêtre de 1 heure
    max: 5, // Limite à 5 opérations par heure
    message: {
        status: 'error',
        message: 'Vous avez atteint la limite pour cette opération. Veuillez réessayer plus tard.'
    }
});


module.exports = {
  apiLimiter,
  authLimiter,
  sensitiveOperationLimiter,
};