// ==============================================================================
//           Middleware de Logging avec Winston
//
// MISE À JOUR : Le `httpLogger` est amélioré pour inclure le statut de
// la réponse et le temps d'exécution, le rendant aussi informatif que Morgan.
// ==============================================================================

const winston = require('winston');
const path = require('path');
const onFinished = require('on-finished'); // Pour logger après la fin de la réponse
require('winston-daily-rotate-file');

// --- Définition des niveaux et couleurs ---
const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };
winston.addColors(colors);

// --- Format des logs ---
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  // On ajoute les métadonnées (comme l'objet error) au message de log
  winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
  // En production, format JSON
  process.env.NODE_ENV === 'production'
    ? winston.format.json()
    // En développement, format texte coloré
    : winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => {
          let log = `${info.timestamp} ${info.level}: ${info.message}`;
          // Affiche les métadonnées si elles existent
          if (Object.keys(info.metadata).length) {
            log += ` ${JSON.stringify(info.metadata, null, 2)}`;
          }
          return log;
        })
      )
);

// --- Définition des Transports ---
const transports = [
  // Toujours logger dans la console
  new winston.transports.Console(),
];
if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '..', 'logs', 'app-%DATE%.log'),
      datePattern: 'YYYY-MM-DD', zippedArchive: true, maxSize: '20m', maxFiles: '14d', level: 'info',
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(__dirname, '..', 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD', zippedArchive: true, maxSize: '20m', maxFiles: '14d', level: 'error',
    })
  );
}

// --- Création du Logger ---
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  levels,
  format: logFormat,
  transports,
  exitOnError: false,
});

/**
 * Middleware amélioré pour logger les requêtes HTTP.
 */
const httpLogger = (req, res, next) => {
    const start = Date.now();
    const { method, url, ip } = req;

    // `onFinished` est un écouteur qui se déclenche juste avant que la réponse ne soit envoyée.
    onFinished(res, (err, finalRes) => {
        const ms = Date.now() - start;
        const { statusCode } = finalRes;
        const message = `${method} ${url} ${statusCode} - ${ms}ms - IP: ${ip}`;
        
        // On logue en `warn` ou `error` si le statut est >= 400
        if (statusCode >= 500) {
            logger.error(message);
        } else if (statusCode >= 400) {
            logger.warn(message);
        } else {
            logger.http(message);
        }
    });

    next();
}

module.exports = {
    logger,
    httpLogger,
};