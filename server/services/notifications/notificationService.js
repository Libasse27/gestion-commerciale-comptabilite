// server/services/notifications/notificationService.js
const Notification = require('../../models/system/Notification');
const { getIO } = require('../../config/socket');
const { logger } = require('../../middleware/logger');
const AppError = require('../../utils/appError');

async function createNotification({ destinataire, type, message, lien }) {
  if (!destinataire || !type || !message) {
    logger.error('Données manquantes pour la création de notification.', { destinataire, type, message });
    return;
  }

  try {
    const notification = await Notification.create({ destinataire, type, message, lien });
    const io = getIO();
    if (io) {
      io.to(destinataire.toString()).emit('nouvelle_notification', notification.toObject());
      logger.info(`Notification temps réel envoyée à ${destinataire}.`);
    }
    
    return notification;
  } catch (error) {
    logger.error('Erreur lors de la création de la notification.', { error: error.message });
  }
}

async function markNotificationsAsRead(userId, notificationIds) {
    const filter = { destinataire: userId, statut: 'Non lue' };
    
    if (notificationIds && Array.isArray(notificationIds) && notificationIds.length > 0) {
        filter._id = { $in: notificationIds };
    }

    const updateResult = await Notification.updateMany(
        filter,
        { $set: { statut: 'Lue', dateLecture: new Date() } }
    );
    
    // Notifier le client que des notifications ont été lues pour mettre à jour le compteur
    const io = getIO();
    if (io && updateResult.modifiedCount > 0) {
        io.to(userId.toString()).emit('notifications_lues', {
            count: updateResult.modifiedCount,
            ids: notificationIds // Envoyer les IDs pour une mise à jour ciblée de l'UI
        });
    }

    return { modifiedCount: updateResult.modifiedCount };
}

module.exports = {
  createNotification,
  markNotificationsAsRead,
};