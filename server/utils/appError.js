// ==============================================================================
//                Classe d'Erreur Personnalisée pour l'Application
//
// Cette classe étend la classe `Error` native de JavaScript pour créer un type
// d'erreur standardisé pour notre application.
//
// L'objectif est de pouvoir générer des erreurs "opérationnelles", c'est-à-dire
// des erreurs prévisibles dont nous voulons afficher le message au client
// (ex: "Utilisateur non trouvé", "Données invalides").
//
// Les erreurs qui ne sont pas des instances de `AppError` seront considérées
// comme des bugs ou des erreurs système et ne fuiteront pas d'informations
// en production.
// ==============================================================================

class AppError extends Error {
  /**
   * Crée une instance de AppError.
   * @param {string} message - Le message d'erreur qui sera envoyé au client.
   * @param {number} statusCode - Le code de statut HTTP associé à l'erreur (ex: 400, 404, 401).
   */
  constructor(message, statusCode) {
    // 1. Appeler le constructeur parent (`Error`) avec le message.
    super(message);

    // 2. Assigner le code de statut et le statut ('fail' ou 'error') correspondants.
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

    // 3. Marquer cette erreur comme "opérationnelle".
    // Notre gestionnaire d'erreurs global utilisera cette propriété pour décider
    // s'il doit afficher le message d'erreur en production ou le cacher.
    this.isOperational = true;

    // 4. Capturer la stack trace pour un débogage plus facile, en excluant
    // le constructeur de la pile d'appel pour ne pas polluer le log.
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;