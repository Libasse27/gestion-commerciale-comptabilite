// ==============================================================================
//           Service de Gestion des Relances Automatiques
//
// MISE À JOUR : Ce service délègue maintenant la composition et l'envoi des
// emails au `emailService`, se concentrant uniquement sur la logique métier
// de la relance (quand et pourquoi relancer).
// ==============================================================================

const Facture = require('../../models/commercial/Facture');
const Relance = require('../../models/paiements/Relance');
const { DOCUMENT_STATUS } = require('../../utils/constants');
const emailService = require('../notifications/emailService'); // Import du service email
const { logger } = require('../../middleware/logger');

/**
 * Identifie les factures en retard et met à jour leur statut.
 * @private
 */
async function _findAndUpdateOverdueInvoices() {
  const today = new Date();
  
  const overdueInvoices = await Facture.find({
    statut: { $in: [DOCUMENT_STATUS.ENVOYE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE, DOCUMENT_STATUS.EN_RETARD] },
    dateEcheance: { $lt: today }
  }).populate('client', 'nom email');

  for (const invoice of overdueInvoices) {
    if (invoice.statut !== DOCUMENT_STATUS.EN_RETARD) {
      invoice.statut = DOCUMENT_STATUS.EN_RETARD;
      await invoice.save();
    }
  }

  return overdueInvoices;
}

/**
 * Traite une facture en retard pour déterminer si une relance doit être envoyée.
 * @private
 */
async function _processReminderForInvoice(facture) {
  if (!facture.client || !facture.client.email) {
    logger.warn(`Impossible de relancer la facture ${facture.numero} : client ou email manquant.`);
    return;
  }
  
  const [lastReminder] = await Relance.find({ facture: facture._id }).sort({ createdAt: -1 }).limit(1);
  
  // Règle métier : ne pas envoyer une nouvelle relance si la dernière date de moins de 7 jours
  const minDaysBetweenReminders = 7;
  if (lastReminder) {
      const daysSinceLastReminder = (new Date() - lastReminder.createdAt) / (1000 * 60 * 60 * 24);
      if (daysSinceLastReminder < minDaysBetweenReminders) {
          logger.info(`Relance pour la facture ${facture.numero} ignorée (dernière relance il y a ${Math.floor(daysSinceLastReminder)} jours).`);
          return;
      }
  }

  const reminderLevel = lastReminder ? lastReminder.niveau + 1 : 1;

  // Déléguer l'envoi de l'email
  // Le emailService pourrait lui-même contenir la logique du switch/case
  // pour adapter le template en fonction du niveau.
  if (reminderLevel <= 2) { // On n'envoie que 2 relances automatiques
    await emailService.sendRelanceFacture(facture, facture.client, reminderLevel);

    // Enregistrer l'action de relance dans l'historique
    await Relance.create({
      client: facture.client._id,
      facture: facture._id,
      niveau: reminderLevel,
    });
  } else {
      logger.warn(`La facture ${facture.numero} a atteint le niveau de relance maximum (${reminderLevel - 1}). Action manuelle requise.`);
  }
}

/**
 * Fonction principale du service, appelée par le cron job.
 */
async function runAutomatedReminders() {
  logger.info('--- Démarrage de la tâche de relances automatiques ---');
  try {
    const invoicesToRemind = await _findAndUpdateOverdueInvoices();
    
    if (invoicesToRemind.length === 0) {
      logger.info('Aucune facture en retard à traiter aujourd\'hui.');
      return;
    }
    
    logger.info(`${invoicesToRemind.length} facture(s) en retard identifiée(s). Traitement en cours...`);

    for (const invoice of invoicesToRemind) {
      await _processReminderForInvoice(invoice);
    }
    
  } catch (error) {
    logger.error('Une erreur est survenue dans le service de relance automatique.', { error });
  } finally {
    logger.info('--- Tâche de relances automatiques terminée ---');
  }
}

module.exports = {
  runAutomatedReminders,
};