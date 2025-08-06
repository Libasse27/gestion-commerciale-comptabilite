// server/services/system/auditLogService.js
const AuditLog = require('../../models/system/AuditLog');
const { logger } = require('../../middleware/logger');
const { AUDIT_LOG_ACTIONS } = require('../../utils/constants');

/**
 * Crée une entrée de log. Conçu pour être "fire-and-forget".
 * @private
 */
function _log(logData) {
  AuditLog.create(logData).catch(err => {
    logger.error("Échec de l'écriture dans le journal d'audit", {
      errorMessage: err.message,
      logDataAttempted: logData,
    });
  });
}

/**
 * Journalise une action de création (CREATE).
 */
function logCreate({ user, entity, entityId, ipAddress }) {
  _log({
    user, action: AUDIT_LOG_ACTIONS.CREATE, entity, entityId,
    status: 'SUCCESS', ipAddress,
    details: `${entity} (ID: ${entityId}) a été créé(e).`
  });
}

/**
 * Journalise une action de mise à jour (UPDATE) en comparant les états.
 */
function logUpdate({ user, entity, entityId, ipAddress }, before, after) {
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  const changes = {};

  for (const key of allKeys) {
    // Ignorer les champs techniques ou non pertinents
    if (['password', '_id', 'updatedAt', '__v', 'passwordChangedAt'].includes(key)) continue;
    
    // Convertir en chaîne pour une comparaison fiable
    const beforeValue = String(before[key] ?? '');
    const afterValue = String(after[key] ?? '');

    if (beforeValue !== afterValue) {
      changes[key] = { from: before[key], to: after[key] };
    }
  }

  if (Object.keys(changes).length === 0) return; // Ne pas logger si aucun changement pertinent

  _log({
    user, action: AUDIT_LOG_ACTIONS.UPDATE, entity, entityId,
    status: 'SUCCESS', ipAddress, details: { changes },
  });
}

/**
 * Journalise une action de suppression (DELETE).
 */
function logDelete({ user, entity, entityId, ipAddress }) {
  _log({
    user, action: AUDIT_LOG_ACTIONS.DELETE, entity, entityId,
    status: 'SUCCESS', ipAddress,
    details: `${entity} (ID: ${entityId}) a été supprimé(e).`
  });
}

/**
 * Journalise un événement système (ex: connexion, échec, export).
 */
function logSystemEvent({ action, status, ipAddress, user = null, entity = 'System', entityId = null, details }) {
  _log({
    user, action, entity, entityId, status, ipAddress, details,
  });
}

module.exports = {
  logCreate,
  logUpdate,
  logDelete,
  logSystemEvent,
};