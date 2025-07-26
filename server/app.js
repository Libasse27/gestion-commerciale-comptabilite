// ==============================================================================
//               CONFIGURATION CENTRALE DE L'APPLICATION EXPRESS
//
// Ce fichier initialise l'application Express, configure tous les middlewares
// essentiels, définit les routes principales et met en place la gestion des erreurs.
// L'objet 'app' est ensuite exporté pour être utilisé par le serveur HTTP.
// ==============================================================================

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

// --- Initialisation de l'application Express ---
const app = express();

// --- Configuration des Middlewares de Sécurité et de Logging ---

// 1. Helmet: Aide à sécuriser les applications Express en définissant divers en-têtes HTTP.
app.use(helmet());

// 2. CORS: Active les Cross-Origin Resource Sharing pour autoriser les requêtes du frontend.
// La configuration est rendue dynamique via une variable d'environnement.
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  optionsSuccessStatus: 200 // Pour les navigateurs plus anciens
};
app.use(cors(corsOptions));

// 3. Morgan: Logger de requêtes HTTP pour le développement.
// En mode 'dev', il donne des logs concis et colorés.
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// 4. Body Parsers: Pour analyser les corps de requête JSON et URL-encoded.
app.use(express.json({ limit: '10kb' })); // Limite la taille du corps JSON
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Rate Limiter: Protège contre les attaques par force brute ou DoS.
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limite chaque IP à 100 requêtes par fenêtre
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Trop de requêtes envoyées depuis cette IP, veuillez réessayer après 15 minutes.'
});
app.use('/api', limiter); // Applique le rate limiter à toutes les routes API

// --- Routes de l'API ---
app.get('/', (req, res) => {
  res.status(200).send('API de l\'ERP Commercial & Comptable Sénégal - Statut : OK');
});

// TODO: Implémenter les routes principales ici
// Exemple:
// const authRoutes = require('./routes/auth');
// app.use('/api/v1/auth', authRoutes);


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

module.exports = app;