/**
 * Un "wrapper" pour les fonctions de contrôleur asynchrones.
 * Il attrape les erreurs des promesses et les passe à `next()`
 * pour qu'elles soient gérées par le middleware d'erreur global.
 * @param {function} fn - La fonction de contrôleur asynchrone.
 * @returns {function} Une nouvelle fonction qui gère les erreurs.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;