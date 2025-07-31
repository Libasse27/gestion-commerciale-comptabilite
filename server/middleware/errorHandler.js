// ==============================================================================
//                Middleware Global de Gestion des Erreurs
//
// Ce middleware est le dernier de la chaîne. Il attrape toutes les erreurs
// qui sont passées via `next(error)` dans l'application.
//
// Il est responsable de formater une réponse d'erreur JSON cohérente, de
// gérer différents types d'erreurs (Mongoose, JWT, etc.), et d'éviter de
// fuiter des détails sensibles (comme la stack trace) en production.
// ==============================================================================

const AppError = require('../utils/appError');

/**
 * Gère les erreurs de cast de Mongoose (ex: un ObjectId invalide).
 * @param {Error} err L'erreur Mongoose.
 * @returns {AppError} Une nouvelle AppError formatée.
 */
const handleCastErrorDB = (err) => {
  const message = `Ressource invalide. Le format du champ ${err.path} est incorrect.`;
  return new AppError(message, 400);
};

/**
 * Gère les erreurs de champ dupliqué de Mongoose (code 11000).
 * @param {Error} err L'erreur Mongoose.
 * @returns {AppError} Une nouvelle AppError formatée.
 */
const handleDuplicateFieldsDB = (err) => {
  // Extrait la valeur dupliquée du message d'erreur
  const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
  const message = `La valeur ${value} existe déjà. Veuillez en utiliser une autre.`;
  return new AppError(message, 400);
};

/**
 * Gère les erreurs de validation de Mongoose (ex: champ requis manquant).
 * @param {Error} err L'erreur Mongoose.
 * @returns {AppError} Une nouvelle AppError formatée.
 */
const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Données d'entrée invalides : ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Gère les erreurs de signature JWT invalide.
 * @returns {AppError}
 */
const handleJWTError = () => new AppError('Token invalide. Veuillez vous reconnecter.', 401);

/**
 * Gère les erreurs de token JWT expiré.
 * @returns {AppError}
 */
const handleJWTExpiredError = () => new AppError('Votre session a expiré. Veuillez vous reconnecter.', 401);


/**
 * Envoie une réponse d'erreur détaillée pour l'environnement de développement.
 */
const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

/**
 * Envoie une réponse d'erreur générique et sécurisée pour l'environnement de production.
 */
const sendErrorProd = (err, res) => {
  // A) Erreurs opérationnelles, de confiance : on envoie le message au client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  }

  // B) Erreurs de programmation ou autres erreurs inconnues : ne pas fuiter les détails
  // 1) Logger l'erreur pour les développeurs
  console.error('ERREUR 💥', err);
  // 2) Envoyer une réponse générique
  return res.status(500).json({
    status: 'error',
    message: 'Une erreur interne est survenue. Veuillez réessayer plus tard.',
  });
};

// --- EXPORTATION DU MIDDLEWARE PRINCIPAL ---
module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    // Crée une copie de l'erreur pour éviter de modifier l'original
    let error = { ...err, name: err.name, message: err.message, code: err.code };

    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};