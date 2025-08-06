// server/middleware/logger.js

// ==============================================================================
//                Middleware et Service de Logging avec Winston
//
// Version optimisée pour la performance et la robustesse.
// - L'écriture dans les fichiers est asynchrone en production.
// - Gestion centralisée des exceptions non interceptées et des promesses rejetées.
// - Masquage des données sensibles dans les logs d'erreur.
// ==============================================================================

const winston = require('winston');
const path = require('path');
const fs = require('fs');
const onFinished = require('on-finished');
const { formatObjectForLog } = require('../utils/formatters');
require('winston-daily-rotate-file');

// === Configuration de l'environnement ===
const isProduction = process.env.NODE_ENV === 'production';
const logDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// === Définition des niveaux et couleurs ===
const levels = { error: 0, warn: 1, info: 2, http: 3, debug: 4 };
const colors = { error: 'red', warn: 'yellow', info: 'green', http: 'magenta', debug: 'white' };
winston.addColors(colors);

// === Format des logs ===
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

const developmentFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    return `${timestamp} ${level}: ${message}${stack ? `\n${stack}` : ''}`;
  })
);

// === Création du logger ===
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || (isProduction ? 'info' : 'debug'),
  levels,
  format: logFormat,
  transports: [
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, maxSize: '20m', maxFiles: '30d', level: 'error',
    }),
    new winston.transports.DailyRotateFile({
      filename: path.join(logDir, 'application-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true, maxSize: '20m', maxFiles: '14d',
    }),
  ],
  exceptionHandlers: [ new winston.transports.DailyRotateFile({ filename: path.join(logDir, 'exceptions-%DATE%.log') }) ],
  rejectionHandlers: [ new winston.transports.DailyRotateFile({ filename: path.join(logDir, 'rejections-%DATE%.log') }) ],
  exitOnError: false,
});

// En développement, ajouter la console avec un format lisible
if (!isProduction) {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(winston.format.colorize(), developmentFormat),
  }));
}

// === Middleware HTTP Logger ===
const httpLogger = (req, res, next) => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  onFinished(res, (err, finalRes) => {
    const duration = Date.now() - start;
    const { statusCode } = finalRes;
    const message = `${method} ${originalUrl} ${statusCode} [${duration}ms] - IP: ${ip}`;

    if (err || statusCode >= 500) {
      logger.error(message, { error: err ? err.message : 'Server Error' });
    } else if (statusCode >= 400) {
      logger.warn(message);
    } else {
      logger.http(message);
    }
  });

  next();
};

// === Middleware Logger d'Erreur ===
const logErrorMiddleware = (err, req, res, next) => {
  const meta = {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
  };
  
  if (req.body && Object.keys(req.body).length > 0) {
      meta.body = formatObjectForLog(req.body);
  }

  logger.error(err.message, meta);

  next(err);
};

module.exports = {
  logger,
  httpLogger,
  logErrorMiddleware,
};