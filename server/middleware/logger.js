// ==============================================================================
//                Middleware et Service de Logging avec Winston
//
// Ce module configure un logger robuste et professionnel en utilisant Winston.
// Il gère différents niveaux, formats et transports (sorties) selon l'environnement.
//
// - En développement: logs colorés et lisibles dans la console.
// - En production: logs au format JSON, stockés dans des fichiers rotatifs
//   (un pour les infos générales, un pour les erreurs).
// ==============================================================================

const winston = require('winston');
const path = require('path');
const onFinished = require('on-finished');
require('winston-daily-rotate-file');

// Définition des niveaux de log et des couleurs associées
const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };
winston.addColors(colors);

// Format des logs : JSON en production, format texte coloré en développement
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] }),
  process.env.NODE_ENV === 'production'
    ? winston.format.json()
    : winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => {
          let log = `${info.timestamp} ${info.level}: ${info.message}`;
          if (Object.keys(info.metadata).length) {
            log += ` ${JSON.stringify(info.metadata, null, 2)}`;
          }
          return log;
        })
      )
);

// Transports (sorties) des logs : toujours la console.
const transports = [
  new winston.transports.Console(),
];

// En production, on ajoute les fichiers rotatifs
if (process.env.NODE_ENV === 'production') {
  transports.push(
    // Fichier pour tous les logs de niveau 'info' et plus
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '..', 'logs', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
      level: 'info',
    }),
    // Fichier séparé uniquement pour les erreurs critiques
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

// Création de l'instance du logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format: logFormat,
  transports,
  exitOnError: false, // Ne pas arrêter l'application sur une erreur de log
});

/**
 * Middleware pour logger les requêtes HTTP entrantes.
 */
const httpLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  // onFinished se déclenche quand la réponse est envoyée
  onFinished(res, (err, finalRes) => {
    const ms = Date.now() - start;
    const { statusCode } = finalRes;
    const message = `${method} ${originalUrl} ${statusCode} [${ms}ms] - IP: ${ip}`;

    if (err || statusCode >= 500) {
      logger.error(message, { error: err ? err.message : 'Server Error' });
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message); // Niveau 'http' pour les requêtes réussies
    }
  });

  next();
};

/**
 * Middleware pour logger automatiquement les erreurs attrapées par le gestionnaire global.
 * Ce middleware ne fait que logger l'erreur, il ne l'envoie pas au client.
 */
const logErrorMiddleware = (err, req, res, next) => {
  logger.error(err.message, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    // Ne pas logger les données sensibles comme le corps de la requête en production.
    ...(process.env.NODE_ENV === 'development' && { body: req.body }),
  });
  next(err); // Passe l'erreur au gestionnaire suivant (errorHandler)
};


module.exports = {
  logger,
  httpLogger,
  logErrorMiddleware,
};