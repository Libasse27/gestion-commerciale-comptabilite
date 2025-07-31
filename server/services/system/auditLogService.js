// ==============================================================================
//           Service pour la Gestion du Journal d'Audit
//
// Ce service fournit une interface simple pour enregistrer des événements
// d'audit dans la base de données.
//
// Il est conçu pour être "fire-and-forget" : un échec lors de l'écriture
// d'un log ne doit pas interrompre le flux principal de l'application.
// L'échec est simplement enregistré dans les logs du serveur.
// ==============================================================================

const AuditLog = require('../../models/system/AuditLog');
const { logger } = require('../../middleware/logger');

/**
 * Crée une nouvelle entrée dans le journal d'audit de manière asynchrone.
 *
 * @param {object} logData - Les données à enregistrer dans le journal.
 * @param {import('mongoose').Types.ObjectId | null} logData.user - L'ID de l'utilisateur qui effectue l'action.
 * @param {string} logData.action - Le type d'action (ex: 'CREATE', 'LOGIN_SUCCESS').
 * @param {string} logData.entity - Le type de ressource affectée (ex: 'Client', 'Facture').
 * @param {import('mongoose').Types.ObjectId} [logData.entityId] - L'ID de la ressource affectée.
 * @param {'SUCCESS' | 'FAILURE'} logData.status - Le résultat de l'action.
 * @param {string} [logData.ipAddress] - L'adresse IP de la requête.
 * @param {object | string} [logData.details] - Des détails supplémentaires (ex: données avant/après, message d'erreur).
 */
function logAction(logData) {
  // On ne met pas `await` ici. On lance la création du log et on continue
  // immédiatement le flux de l'application sans attendre le résultat.
  AuditLog.create(logData)
    .catch(err => {
      // Si la création du log échoue, on ne veut surtout pas que l'application
      // plante. On se contente d'enregistrer cette erreur de logging dans
      // les logs du serveur. C'est une erreur de l'infrastructure, pas de la requête.
      logger.error("Échec critique de l'écriture dans le journal d'audit", {
        errorMessage: err.message,
        logDataAttempted: logData, // On logue les données qu'on a tenté d'écrire
      });
    });
}


module.exports = {
  logAction,
};