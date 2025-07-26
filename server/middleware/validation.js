// ==============================================================================
//                Middleware de Gestion des Résultats de Validation
//
// Ce middleware travaille en tandem avec `express-validator`. Son unique
// rôle est de s'exécuter après une chaîne de validateurs (ex: `check('email').isEmail()`)
// pour :
//   1. Collecter les erreurs de validation potentielles.
//   2. S'il y a des erreurs, arrêter la chaîne de requêtes et renvoyer une
//      réponse HTTP 400 avec une liste claire des erreurs.
//   3. Si tout est valide, passer simplement au prochain middleware (le contrôleur).
//
// Cela permet de ne pas répéter le code de gestion des erreurs de validation
// dans chaque fichier de route.
// ==============================================================================

const { validationResult } = require('express-validator');

/**
 * Middleware qui vérifie et gère les erreurs de validation.
 * Doit être placé après les middlewares de validation d'express-validator dans une route.
 */
const handleValidationErrors = (req, res, next) => {
  // `validationResult` collecte toutes les erreurs trouvées par les validateurs précédents.
  const errors = validationResult(req);

  // S'il n'y a pas d'erreur, on passe au contrôleur.
  if (errors.isEmpty()) {
    return next();
  }

  // S'il y a des erreurs, on les formate et on renvoie une réponse 400.
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

  return res.status(400).json({
    status: 'fail',
    message: 'Les données fournies sont invalides.',
    errors: extractedErrors,
  });
};

module.exports = {
  handleValidationErrors,
};