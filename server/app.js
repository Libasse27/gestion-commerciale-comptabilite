// ==============================================================================
//               CONFIGURATION CENTRALE DE L'APPLICATION EXPRESS
//
// Ce fichier initialise Express, configure tous les middlewares globaux,
// branche le routeur principal de l'API, et met en place la gestion des erreurs.
// L'objet 'app' est ensuite exporté pour être utilisé par le serveur HTTP.
// ==============================================================================

const express = require('express');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const morgan = require('morgan'); // Morgan pour le logging HTTP

// --- Importation des Middlewares et Configurations Personnalisés ---
const configuredCors = require('./middleware/cors.js');
const globalErrorHandler = require('./middleware/errorHandler.js');
const AppError = require('./utils/appError.js');
const { apiLimiter } = require('./middleware/rateLimiter.js');
const mainRouter = require('./routes/index.js'); // Importation du routeur principal

// --- Initialisation de l'application Express ---
const app = express();

// --- Chaîne de Middlewares Globaux ---
app.use(helmet()); // Sécurise les en-têtes HTTP
app.use(configuredCors);

// On utilise Morgan pour logger les requêtes HTTP dans la console en développement.
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Middlewares pour parser le corps des requêtes
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Applique le limiteur de requêtes à toutes les routes /api
app.use('/api', apiLimiter);

// --- Routes de l'API ---
// C'est ici qu'on branche notre routeur principal
app.use('/api/v1', mainRouter);

// --- Gestion des Erreurs ---
// 1. Gestion des routes non trouvées (404)
app.use((req, res, next) => {
  const error = new AppError(`Route non trouvée - ${req.originalUrl}`, 404);
  next(error);
});

// 2. Gestionnaire d'erreurs global (le seul et unique)
// Express sait que c'est un middleware d'erreur car il a 4 arguments.
app.use(globalErrorHandler);

// --- Exportation de l'Application Configurée ---
module.exports = app;