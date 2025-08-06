const twilio = require('twilio');
const { logger } = require('../../middleware/logger');
const { formatCurrency } = require('../../utils/formatters'); // Utiliser le formatter central

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

let twilioClient;
let isTwilioConfigured = false;

if (accountSid && authToken && twilioPhoneNumber) {
  try {
    twilioClient = twilio(accountSid, authToken);
    isTwilioConfigured = true;
    logger.info('✅ Service SMS (Twilio) configuré.');
  } catch (error) {
    logger.error('❌ Erreur de configuration du client Twilio.', { error: error.message });
  }
} else {
  logger.warn('⚠️ Configuration Twilio manquante. Le service SMS est désactivé et simulera les envois.');
}

const _formatPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return null;
    let digits = phoneNumber.toString().replace(/\D/g, '');
    if (digits.length === 9) return `+221${digits}`;
    if (digits.startsWith('221') && digits.length === 12) return `+${digits}`;
    logger.warn(`Format de numéro non reconnu pour SMS: ${phoneNumber}`);
    return null;
}

async function sendSms(to, body) {
  if (!isTwilioConfigured) {
    logger.info(`[SMS SIMULATION] To: ${to} | Body: "${body}"`);
    return;
  }

  const formattedTo = _formatPhoneNumber(to);
  if (!formattedTo) {
      logger.error(`Numéro invalide pour SMS: ${to}`);
      return;
  }

  try {
    const message = await twilioClient.messages.create({ body, from: twilioPhoneNumber, to: formattedTo });
    logger.info(`SMS envoyé à ${formattedTo}. SID: ${message.sid}`);
  } catch (error) {
    logger.error(`Échec de l'envoi du SMS à ${to}`, { error: error.message, code: error.code });
  }
}

async function sendNotificationFacture(client, facture) {
    if (!client.telephone) return;
    const message = `Bonjour ${client.nom}, votre facture N°${facture.numero} d'un montant de ${formatCurrency(facture.totalTTC)} est disponible.`;
    await sendSms(client.telephone, message);
}

async function sendRelanceFacture(client, facture) {
    if (!client.telephone) return;
    const message = `Rappel: Facture N°${facture.numero} de ${formatCurrency(facture.totalTTC)} impayée. Merci de procéder au règlement.`;
    await sendSms(client.telephone, message);
}

module.exports = { sendSms, sendNotificationFacture, sendRelanceFacture };