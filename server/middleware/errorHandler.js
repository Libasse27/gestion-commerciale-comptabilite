// server/middleware/errorHandler.js
// ==============================================================================
//                Middleware Global de Gestion des Erreurs
//
// Ce middleware attrape toutes les erreurs passées via `next(error)`.
// Il est responsable de formater une réponse d'erreur JSON cohérente et
// d'éviter de fuiter des détails sensibles en production.
// ==============================================================================

const AppError = require('../utils/appError');
const { logger } = require('../middleware/logger');

const handleCastErrorDB = (err) => {
  const message = `Format invalide pour le champ ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `La valeur ${value} existe déjà. Veuillez en utiliser une autre.`;
  return new AppError(message, 400);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Données d'entrée invalides : ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () => new AppError('Token invalide. Veuillez vous reconnecter.', 401);
const handleJWTExpiredError = () => new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // A) Erreurs opérationnelles : on envoie le message au client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // B) Erreurs de programmation ou inconnues : on ne fuite pas les détails
  // 1) On log l'erreur pour les développeurs
  logger.error('ERREUR NON OPÉRATIONNELLE 💥', err);
  // 2) On envoie une réponse générique
  return res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue. Veuillez réessayer plus tard.',
  });
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err, name: err.name, message: err.message, code: err.code };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};