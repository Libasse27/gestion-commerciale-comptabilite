// server/services/notifications/notificationService.js
const Notification = require('../../models/system/Notification');
const { getIO } = require('../../config/socket');
const AppError = require('../../utils/appError');
const { logger } = require('../../middleware/logger');

/**
 * Crée une notification, la sauvegarde en DB, et la pousse en temps réel.
 */
async function createNotification(notificationData) {
  const { destinataire, type, message, lien } = notificationData;

  if (!destinataire || !type || !message) {
    logger.warn('Tentative de création de notification avec des données manquantes.', { notificationData });
    return;
  }

  try {
    const notification = await Notification.create({ destinataire, type, message, lien });
    const io = getIO();
    if (io) {
        io.to(destinataire.toString()).emit('nouvelle_notification', notification.toObject());
        logger.info(`Notification en temps réel envoyée à l'utilisateur ${destinataire}.`);
    }

    return notification;
  } catch (error) {
    logger.error("Erreur lors de la création de la notification.", { error: error.message, notificationData });
  }
}

/**
 * Marque une notification comme "Lue".
 */
async function markAsRead(notificationId, userId) {
    const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, destinataire: userId, statut: 'Non lue' },
        { $set: { statut: 'Lue', dateLecture: new Date() } },
        { new: true }
    ).lean();

    if (!notification) {
        throw new AppError("Notification non trouvée ou déjà lue.", 404);
    }
    
    const io = getIO();
    if (io) {
        io.to(userId.toString()).emit('notification_lue', { notificationId });
    }

    return notification;
}

/**
 * Marque toutes les notifications non lues d'un utilisateur comme "Lues".
 */
async function markAllAsRead(userId) {
    const result = await Notification.updateMany(
        { destinataire: userId, statut: 'Non lue' },
        { $set: { statut: 'Lue', dateLecture: new Date() } }
    );
    
    const io = getIO();
    if (io && result.modifiedCount > 0) {
        io.to(userId.toString()).emit('notifications_toutes_lues');
    }

    return result;
}

module.exports = {
  createNotification,
  markAsRead,
  markAllAsRead,
};