// ==============================================================================
//               CONFIGURATION CENTRALE DE L'APPLICATION EXPRESS
//
// Ce fichier initialise Express, configure tous les middlewares globaux,
// branche le routeur principal de l'API, et met en place la gestion des erreurs.
// L'objet 'app' est ensuite exporté pour être utilisé par le serveur HTTP.
// ==============================================================================

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser'); // Pour lire les cookies (utilisé par authController)

// --- Importation des Middlewares et Configurations Personnalisés ---
const configuredCors = require('./middleware/cors');
const { httpLogger } = require('./middleware/logger');
const globalErrorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');
const { apiLimiter } = require('./middleware/rateLimiter');
const mainRouter = require('./routes'); // Importation du routeur principal

// --- Initialisation de l'application Express ---
const app = express();


// --- Chaîne de Middlewares Globaux (appliqués à toutes les requêtes) ---

// 1. Sécurité : Helmet (en-têtes HTTP) et CORS (partage de ressources)
app.use(helmet());
app.use(configuredCors);

// 2. Logging : Utilise notre logger Winston pour tracer toutes les requêtes HTTP
app.use(httpLogger);

// 3. Body Parsers : Pour analyser les corps de requête JSON et URL-encoded
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 4. Cookie Parser : Pour analyser les cookies des requêtes (req.cookies)
app.use(cookieParser());

// 5. Rate Limiter : Applique le limiteur général à toutes les routes /api pour prévenir les abus
app.use('/api', apiLimiter);


// --- Routes de l'API ---

// On monte le routeur principal sur le chemin `/api/v1`.
// Toutes les routes de l'application seront préfixées par `/api/v1`.
app.use('/api/v1', mainRouter);


// --- Gestion des Erreurs ---

// 1. Gestion des routes non trouvées (404)
// --- Gestion des Erreurs 404 (Route non trouvée) ---
// Ce middleware est déclenché si aucune des routes ci-dessus n'a correspondu.
app.use((req, res, next) => {
  const error = new Error(`Route non trouvée - ${req.originalUrl}`);
  error.status = 404;
  next(error);
});

// --- Gestionnaire d'Erreurs Global ---
// Ce middleware est déclenché chaque fois que `next(error)` est appelé.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
      // Affiche la stack trace uniquement en développement
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    },
  });
});

// 2. Gestionnaire d'erreurs global
// C'est le dernier middleware de la chaîne, il attrape toutes les erreurs.
app.use(globalErrorHandler);


// --- Exportation de l'Application Configurée ---
module.exports = app;