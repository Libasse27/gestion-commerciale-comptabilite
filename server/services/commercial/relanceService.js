// server/services/commercial/relanceService.js
const Facture = require('../../models/commercial/Facture');
const Relance = require('../../models/paiements/Relance');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const emailService = require('../notifications/emailService');
const smsService = require('../notifications/smsService'); // Importer le service SMS
const { logger } = require('../../middleware/logger');

/**
 * Met à jour le statut des factures dont l'échéance est dépassée.
 * @private
 */
async function _findAndUpdateOverdueInvoices() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Étape 1 : Identifier les factures qui VIENNENT d'être en retard
  const invoicesToUpdate = await Facture.find({
    statut: { $in: [DOCUMENT_STATUS.ENVOYE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE] },
    dateEcheance: { $lt: today }
  }).select('_id').lean();

  if (invoicesToUpdate.length > 0) {
      const ids = invoicesToUpdate.map(inv => inv._id);
      await Facture.updateMany({ _id: { $in: ids } }, { $set: { statut: DOCUMENT_STATUS.EN_RETARD } });
      logger.info(`${ids.length} facture(s) ont été marquées comme "En retard".`);
  }
  
  // Étape 2 : Renvoyer TOUTES les factures en retard (les anciennes + les nouvelles)
  return Facture.find({ statut: DOCUMENT_STATUS.EN_RETARD }).populate('client', 'nom email telephone').lean();
}

/**
 * Envoie une notification de relance (Email ou SMS) et l'enregistre.
 * @private
 */
async function _sendReminder(facture, reminderLevel) {
  const { client } = facture;
  let method = null;

  try {
    if (client.email) {
      method = 'Email';
      await emailService.sendRelanceFacture(facture, client, reminderLevel);
    } else if (client.telephone) {
      method = 'SMS';
      await smsService.sendRelanceFacture(client, facture);
    } else {
      logger.warn(`Aucun contact (email/téléphone) pour la relance de la facture ${facture.numero}.`);
      return;
    }

    await Relance.create({
      client: client._id,
      facture: facture._id,
      niveau: reminderLevel,
      methode: method,
    });

  } catch (error) {
    logger.error(`Échec de l'envoi de la relance (méthode: ${method}) pour la facture ${facture.numero}.`, { error });
  }
}

/**
 * Traite une facture en retard pour déterminer si une relance doit être envoyée.
 * @private
 */
async function _processInvoiceForReminder(facture) {
  const [lastReminder] = await Relance.find({ facture: facture._id }).sort({ createdAt: -1 }).limit(1).lean();
  
  const minDaysBetweenReminders = 7; // Règle métier
  if (lastReminder) {
      const daysSince = (new Date() - new Date(lastReminder.createdAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < minDaysBetweenReminders) {
          return; // Pas assez de temps écoulé
      }
  }

  const reminderLevel = lastReminder ? lastReminder.niveau + 1 : 1;
  const maxAutomaticReminders = 3; // Règle métier
  if (reminderLevel > maxAutomaticReminders) {
    logger.warn(`Facture ${facture.numero}: Niveau de relance max (${maxAutomaticReminders}) atteint. Action manuelle requise.`);
    return;
  }
  
  await _sendReminder(facture, reminderLevel);
}

/**
 * Fonction principale du service, appelée par un cron job.
 */
async function runAutomatedReminders() {
  logger.info('--- Démarrage de la tâche de relances automatiques ---');
  try {
    const invoicesToProcess = await _findAndUpdateOverdueInvoices();
    if (invoicesToProcess.length === 0) {
      logger.info('Aucune facture en retard à traiter.');
      return;
    }
    
    logger.info(`${invoicesToProcess.length} facture(s) en retard. Traitement en cours...`);
    await Promise.all(invoicesToProcess.map(_processInvoiceForReminder));
    
  } catch (error) {
    logger.error('Erreur dans le service de relance.', { error });
  } finally {
    logger.info('--- Tâche de relances automatiques terminée ---');
  }
}

module.exports = {
  runAutomatedReminders,
};