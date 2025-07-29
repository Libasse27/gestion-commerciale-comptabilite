// ==============================================================================
//           Service pour la Gestion des Notifications Internes
//
// Ce service est le point d'entrée unique pour créer des notifications
// destinées aux utilisateurs au sein de l'application.
//
// Il orchestre deux actions principales :
//   1. La persistance de la notification dans la base de données via le
//      modèle `Notification`.
//   2. La diffusion de la notification en temps réel à l'utilisateur concerné
//      via Socket.IO.
// ==============================================================================

const Notification = require('../../models/system/Notification');
const { getIO } = require('../../config/socket'); // Pour l'envoi en temps réel
const { logger } = require('../../middleware/logger');
const AppError = require('../../utils/appError');

/**
 * Crée et envoie une notification à un utilisateur.
 * @param {object} data
 * @param {string} data.destinataireId - L'ID de l'utilisateur qui doit recevoir la notification.
 * @param {('info'|'success'|'warning'|'error'|'assignation')} data.type - Le type de notification.
 * @param {string} data.message - Le message de la notification.
 * @param {string} [data.lien] - (Optionnel) Une URL relative vers la ressource concernée (ex: /factures/123).
 * @returns {Promise<mongoose.Document>} Le document de notification créé.
 */
async function createNotification({ destinataireId, type, message, lien }) {
  if (!destinataireId || !type || !message) {
    throw new AppError('Les champs destinataireId, type, et message sont requis pour créer une notification.', 400);
  }

  try {
    // 1. Sauvegarder la notification dans la base de données
    const notification = await Notification.create({
      destinataire: destinataireId,
      type,
      message,
      lien,
    });
    
    // 2. Envoyer la notification en temps réel via Socket.IO
    const io = getIO();
    if (io) {
      // On émet l'événement dans la "room" privée de l'utilisateur,
      // dont le nom est son propre ID.
      io.to(destinataireId.toString()).emit('nouvelle_notification', notification);
      logger.info(`Notification en temps réel envoyée à l'utilisateur ${destinataireId}.`);
    } else {
      logger.warn('Socket.IO n\'est pas initialisé, la notification en temps réel n\'a pas été envoyée.');
    }
    
    return notification;

  } catch (error) {
    logger.error('Erreur lors de la création de la notification.', { error });
    // On ne propage pas forcément l'erreur pour ne pas bloquer le processus métier principal.
  }
}


/**
 * Marque une ou plusieurs notifications comme lues.
 * @param {string} userId - L'ID de l'utilisateur dont les notifications sont lues.
 * @param {Array<string>} [notificationIds] - (Optionnel) Un tableau d'IDs de notifs à marquer comme lues. Si non fourni, toutes les notifs non lues de l'utilisateur sont marquées.
 * @returns {Promise<{modifiedCount: number}>}
 */
async function markNotificationsAsRead(userId, notificationIds) {
    const filter = {
        destinataire: userId,
        statut: 'Non lue',
    };
    
    if (notificationIds && notificationIds.length > 0) {
        filter._id = { $in: notificationIds };
    }

    const updateResult = await Notification.updateMany(
        filter,
        { $set: { statut: 'Lue', dateLecture: new Date() } }
    );
    
    return { modifiedCount: updateResult.modifiedCount };
}


module.exports = {
  createNotification,
  markNotificationsAsRead,
};