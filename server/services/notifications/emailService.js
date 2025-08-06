const path = require('path');
const ejs = require('ejs');
const { sendEmail } = require('../../config/email');
const { logger } = require('../../middleware/logger');
const { formatCurrency, formatDate } = require('../../utils/formatters');

async function _renderTemplate(templateName, data) {
  try {
    const templatePath = path.join(__dirname, `../../templates/email/${templateName}.ejs`);
    const templateData = { ...data, appUrl: process.env.APP_URL };
    const body = await ejs.renderFile(templatePath, templateData);
    const layoutPath = path.join(__dirname, '../../templates/email/baseLayout.ejs');
    return ejs.renderFile(layoutPath, { body, ...templateData }); // Passer aussi les données au layout
  } catch (error) {
    logger.error(`Erreur lors du rendu du template email '${templateName}'`, { error: error.message });
    throw new Error("Impossible de générer le contenu de l'email.");
  }
}

async function sendWelcomeEmail(user) {
    const subject = `Bienvenue chez ${process.env.APP_NAME || 'ERP Sénégal'} !`;
    const html = await _renderTemplate('welcome', { user });
    await sendEmail({ to: user.email, subject, html });
}

async function sendRelanceFacture(facture, client, niveauRelance) {
    const subject = `Relance ${niveauRelance} - Facture N°${facture.numero} impayée`;
    const templateData = {
        facture, client, niveauRelance,
        totalTTC: formatCurrency(facture.totalTTC),
        dateEcheance: formatDate(facture.dateEcheance)
    };
    const html = await _renderTemplate('relanceFacture', templateData);
    await sendEmail({ to: client.email, subject, html });
    logger.info(`Email de relance (niveau ${niveauRelance}) envoyé pour la facture ${facture.numero}.`);
}

async function sendNouvelleFacture(facture, client) {
    const subject = `Votre nouvelle facture N°${facture.numero}`;
    const html = await _renderTemplate('nouvelleFacture', { facture, client, totalTTC: formatCurrency(facture.totalTTC) });
    await sendEmail({ to: client.email, subject, html });
}

module.exports = {
  sendWelcomeEmail,
  sendRelanceFacture,
  sendNouvelleFacture,
};