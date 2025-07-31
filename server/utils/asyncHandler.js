// ==============================================================================
//                Wrapper pour la Gestion des Erreurs Asynchrones
//
// Ce module exporte une fonction d'ordre supérieur (higher-order function)
// qui prend une fonction de contrôleur asynchrone en argument et retourne
// une nouvelle fonction.
//
// Le but est d'éliminer le besoin de blocs `try...catch` répétitifs dans
// chaque contrôleur. Ce wrapper attrape automatiquement toute erreur survenue
// dans la promesse et la passe au middleware de gestion d'erreurs global
// via `next(error)`.
// ==============================================================================

/**
 * Un "wrapper" pour les fonctions de contrôleur asynchrones.
 * @param {function} fn - La fonction de contrôleur asynchrone (ex: async (req, res, next) => { ... }).
 * @returns {function} Une nouvelle fonction qui gère les erreurs de la promesse.
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;