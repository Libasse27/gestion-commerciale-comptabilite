// server/middleware/validation.js
// ==============================================================================
//                Middleware de Gestion des Résultats de Validation
//
// Ce middleware travaille en tandem avec `express-validator`. Son unique
// rôle est de s'exécuter après une chaîne de validateurs pour :
//   1. Collecter les erreurs de validation.
//   2. S'il y a des erreurs, arrêter la requête et renvoyer une réponse HTTP 400.
//   3. Si tout est valide, passer au contrôleur.
// ==============================================================================

const { validationResult } = require('express-validator');

/**
 * Middleware qui vérifie et gère les erreurs de validation.
 * Doit être placé après les middlewares de validation d'express-validator.
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  // Formater les erreurs pour une réponse claire.
  const extractedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg,
  }));

  return res.status(400).json({
    status: 'fail',
    message: 'Les données fournies sont invalides.',
    errors: extractedErrors,
  });
};

module.exports = {
  handleValidationErrors,
};