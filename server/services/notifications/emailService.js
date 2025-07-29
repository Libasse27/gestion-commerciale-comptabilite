// ==============================================================================
//           Service de Haut Niveau pour l'Envoi d'Emails
//
// Ce service encapsule la logique de préparation et d'envoi d'emails
// transactionnels spécifiques à des actions métier.
//
// Il utilise des templates EJS pour générer le contenu HTML des emails,
// rendant les messages facilement personnalisables.
// ==============================================================================

const path = require('path');
const ejs = require('ejs');
const { sendEmail } = require('../../config/email');
const { logger } = require('../../middleware/logger');
const { formatCurrency, formatDateFr } = require('../../utils/formatters');

/**
 * Fonction privée pour rendre un template EJS en HTML.
 * @private
 */
const _renderTemplate = async (templateName, data) => {
  try {
    const templatePath = path.join(__dirname, `../../templates/email/${templateName}.ejs`);
    let html = await ejs.renderFile(templatePath, data);
    
    // Injecte le HTML généré dans le layout de base
    const layoutPath = path.join(__dirname, '../../templates/email/baseLayout.ejs');
    html = await ejs.renderFile(layoutPath, { body: html });
    
    return html;
  } catch (error) {
    logger.error(`Erreur lors du rendu du template email '${templateName}'`, { error });
    throw new Error('Impossible de générer le contenu de l\'email.');
  }
};


/**
 * Envoie un email de bienvenue à un nouvel utilisateur.
 * @param {object} user - L'objet utilisateur.
 */
async function sendWelcomeEmail(user) {
    const subject = `Bienvenue chez ERP Sénégal, ${user.firstName} !`;
    const html = await _renderTemplate('welcome', { user }); // Suppose un template welcome.ejs
    
    await sendEmail({
        to: user.email,
        subject,
        html,
    });
}


/**
 * Envoie un email de relance pour une facture impayée.
 * @param {object} facture - Le document Mongoose de la facture.
 * @param {object} client - Le document Mongoose du client.
 */
async function sendRelanceFacture(facture, client) {
    const subject = `Rappel amical concernant votre facture N°${facture.numero}`;
    
    // Préparer les données pour le template
    const templateData = {
        facture,
        client,
        totalTTC: formatCurrency(facture.totalTTC),
        dateEcheance: formatDateFr(facture.dateEcheance)
    };
    
    const html = await _renderTemplate('relanceFacture', templateData);

    await sendEmail({
        to: client.email,
        subject,
        html,
    });
    
    logger.info(`Email de relance envoyé pour la facture ${facture.numero} à ${client.email}.`);
}


/**
 * Envoie une notification par email (ex: stock bas).
 * @param {object} user - L'utilisateur destinataire.
 * @param {string} subject - Le sujet de la notification.
 * @param {string} message - Le message à afficher.
 */
async function sendNotificationEmail(user, subject, message) {
    const html = await _renderTemplate('notification', { user, message }); // Suppose un template notification.ejs

    await sendEmail({
        to: user.email,
        subject,
        html,
    });
}


module.exports = {
  sendWelcomeEmail,
  sendRelanceFacture,
  sendNotificationEmail,
};