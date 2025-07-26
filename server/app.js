// ==============================================================================
//               CONFIGURATION CENTRALE DE L'APPLICATION EXPRESS
//
// Ce fichier initialise l'application Express, configure tous les middlewares
// essentiels, définit les routes principales et met en place la gestion des erreurs.
// L'objet 'app' est ensuite exporté pour être utilisé par le serveur HTTP.
// ==============================================================================

const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

// Importation des middlewares et configurations personnalisés
const configuredCors = require('./middleware/cors');
const { httpLogger } = require('./middleware/logger'); // Logger Winston pour les requêtes HTTP
const globalErrorHandler = require('./middleware/errorHandler');
const AppError = require('./utils/appError');
const { apiLimiter } = require('./middleware/rateLimiter');

// TODO: Importer le routeur principal
// const mainRouter = require('./routes/index');

// --- Initialisation de l'application Express ---
const app = express();

// --- Configuration des Middlewares ---

// 1. Sécurité: Helmet (définit des en-têtes HTTP de sécurité)
app.use(helmet());

// 2. CORS: Active les Cross-Origin Resource Sharing avec notre configuration sécurisée
app.use(configuredCors);

// 3. Rate Limiter: Protège contre les attaques par force brute ou DoS sur les routes API
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes envoyées depuis cette IP, veuillez réessayer après 15 minutes.'
});
app.use('/api', limiter);

// 4. Body Parsers: Pour analyser les corps de requête JSON et URL-encoded
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Logging: Utilise notre logger Winston pour tracer toutes les requêtes HTTP
app.use(httpLogger);

// 6. Applique le rate limiter général à toutes les routes /api
app.use('/api', apiLimiter);


// --- Routes de l'API ---

// Route de "health check"
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ status: 'UP', message: 'API de l\'ERP Sénégal - En fonctionnement' });
});

// TODO: Utiliser le routeur principal pour toutes les routes de l'application
// app.use('/api/v1', mainRouter);


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


// 2. Middleware de gestion d'erreurs global
// C'est le dernier middleware de la chaîne, il attrape toutes les erreurs.
app.use(globalErrorHandler);

module.exports = app;