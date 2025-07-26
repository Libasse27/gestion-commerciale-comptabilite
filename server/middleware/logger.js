// ==============================================================================
//           Middleware de Logging avec Winston
//
// Ce module configure Winston, un logger polyvalent et puissant. Il remplace
// `console.log` pour les logs de l'application, offrant plus de contrôle sur
// le format, les niveaux de log, et la destination des messages (console, fichiers).
//
// La configuration est optimisée pour :
// - DÉVELOPPEMENT: Logs colorés et détaillés dans la console.
// - PRODUCTION: Logs formatés en JSON écrits dans des fichiers rotatifs.
// ==============================================================================

const winston = require('winston');
const path = require('path');
require('winston-daily-rotate-file');

// --- Définition des niveaux de log standard ---
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3, // Pour les requêtes (remplace Morgan)
  debug: 4,
};

// --- Définition des couleurs pour la console en développement ---
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};
winston.addColors(colors);


// --- Format des logs ---
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // En production, on privilégie le format JSON pour une analyse facile par des outils externes.
  process.env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}`
      )
);

// --- Définition des "Transports" (où les logs sont envoyés) ---
const transports = [
  // Toujours logger dans la console, mais avec un format différent selon l'environnement
  new winston.transports.Console({
    format: winston.format.combine(
        winston.format.colorize({ all: true })
    )
  }),
];

// En production, on ajoute les transports vers des fichiers
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Transport pour tous les logs de niveau 'info' et plus bas
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '..', 'logs', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, // Compresse les anciens logs
      maxSize: '20m',      // Taille maximale du fichier avant rotation
      maxFiles: '14d',     // Garde les logs pendant 14 jours
      level: 'info',
    }),
    // Transport séparé uniquement pour les logs d'erreurs
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '..', 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'error',
    })
  );
}


// --- Création et Exportation du Logger ---
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format: logFormat,
  transports,
  // Ne pas quitter l'application en cas d'erreur non gérée
  exitOnError: false,
});

/**
 * Middleware pour remplacer Morgan et logger les requêtes HTTP avec Winston.
 */
const httpLogger = (req, res, next) => {
    // Message de log formaté
    const message = `${req.method} ${req.url} - Status: ${res.statusCode} - IP: ${req.ip}`;
    // Le niveau 'http' est utilisé pour ce type de log
    logger.http(message);
    next();
}

module.exports = {
    logger,
    httpLogger,
};