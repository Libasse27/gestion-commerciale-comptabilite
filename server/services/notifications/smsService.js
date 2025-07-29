// ==============================================================================
//           Service de Haut Niveau pour l'Envoi de SMS
//
// Ce service encapsule la logique d'envoi de SMS via un fournisseur externe
// (ex: Twilio). Il agit comme une couche d'abstraction pour le reste de
// l'application.
//
// Il est conçu pour être "fail-safe" : un échec d'envoi de SMS ne doit pas
// faire planter l'opération métier principale.
// ==============================================================================

const twilio = require('twilio');
const { logger } = require('../../middleware/logger');
const AppError = require('../../utils/appError');

// --- Configuration (depuis les variables d'environnement) ---
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER; // Votre numéro de téléphone Twilio

let twilioClient;
let isTwilioConfigured = false;

if (accountSid && authToken && twilioPhoneNumber) {
  try {
    twilioClient = twilio(accountSid, authToken);
    isTwilioConfigured = true;
    logger.info('✅ Service SMS (Twilio) configuré avec succès.');
  } catch (error) {
    logger.error('❌ Erreur de configuration du client Twilio.', { error: error.message });
  }
} else {
  logger.warn('⚠️  Configuration Twilio manquante. Le service SMS sera désactivé.');
}


/**
 * Formate un numéro de téléphone au format E.164 (ex: +221771234567).
 * C'est le format requis par la plupart des API SMS.
 * @private
 */
const _formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return null;
    let digits = phoneNumber.toString().replace(/\D/g, '');
    if (digits.startsWith('221') && digits.length === 12) {
        return `+${digits}`;
    }
    if (digits.length === 9) {
        return `+221${digits}`;
    }
    return null; // Retourne null si le format est invalide
}


/**
 * Envoie un message SMS.
 *
 * @param {string} to - Le numéro de téléphone du destinataire.
 * @param {string} body - Le corps du message SMS.
 * @returns {Promise<void>}
 */
async function sendSms(to, body) {
  if (!isTwilioConfigured) {
    logger.warn(`Tentative d'envoi de SMS à ${to}, mais le service n'est pas configuré.`);
    return; // Ne rien faire si le service n'est pas configuré
  }

  const formattedTo = _formatPhoneNumber(to);
  if (!formattedTo) {
      logger.error(`Numéro de téléphone invalide pour l'envoi de SMS: ${to}`);
      return;
  }

  try {
    const message = await twilioClient.messages.create({
      body: body,
      from: twilioPhoneNumber,
      to: formattedTo,
    });
    
    logger.info(`SMS envoyé avec succès à ${formattedTo}. SID: ${message.sid}`);
  } catch (error) {
    // Un échec d'envoi de SMS ne doit pas bloquer l'application.
    // On se contente de logger l'erreur.
    logger.error(`Échec de l'envoi du SMS à ${to}`, {
        error: error.message,
        code: error.code
    });
  }
}


/**
 * Envoie une notification de facture par SMS.
 * @param {object} client - L'objet client.
 * @param {object} facture - L'objet facture.
 */
async function sendNotificationFacture(client, facture) {
    if (!client.telephone) {
        logger.warn(`Pas de numéro de téléphone pour le client ${client.nom}, impossible d'envoyer la notification SMS.`);
        return;
    }
    const message = `Bonjour ${client.nom}, votre facture N°${facture.numero} d'un montant de ${facture.totalTTC} XOF est maintenant disponible.`;
    await sendSms(client.telephone, message);
}


module.exports = {
  sendSms,
  sendNotificationFacture,
};