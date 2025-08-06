// server/config/email.js
const nodemailer = require('nodemailer');
const { logger } = require('../middleware/logger');

let transporter;
// Cette promesse nous permettra d'attendre la fin de l'initialisation
// avant d'envoyer un email, évitant ainsi une race condition.
let initializationPromise;

/**
 * Initialise le transporteur Nodemailer en fonction de l'environnement.
 */
const initializeTransporter = () => {
  initializationPromise = (async () => {
    try {
      if (process.env.NODE_ENV === 'production') {
        // --- Configuration pour la PRODUCTION ---
        if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
          logger.error('CONFIG ERROR: Les variables SMTP pour la production ne sont pas définies.');
          return; // Ne pas continuer si la config est absente
        }
        transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT, 10) || 587,
          secure: (parseInt(process.env.SMTP_PORT, 10) || 587) === 465, // true for 465, false for other ports
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });
      } else {
        // --- Configuration pour le DÉVELOPPEMENT avec Ethereal ---
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        });
        logger.info('📬 Transporteur d\'emails (DEV) initialisé via Ethereal.');
      }

      await transporter.verify();
      logger.info('✅ Le serveur d\'emails est prêt à recevoir des messages.');

    } catch (error) {
      logger.error(`❌ Échec de l'initialisation du transporteur d'emails: ${error.message}`);
    }
  })();
};

/**
 * Envoie un email en utilisant le transporteur configuré.
 * @param {object} options - Options de l'email.
 * @param {string} options.to - Le ou les destinataires.
 * @param {string} options.subject - Le sujet de l'email.
 * @param {string} options.text - La version texte brut de l'email.
 * @param {string} options.html - La version HTML de l'email.
 */
const sendEmail = async (options) => {
  // On attend que l'initialisation soit terminée
  await initializationPromise;

  if (!transporter) {
    logger.error("Le transporteur d'emails n'est pas initialisé. Email non envoyé.", { subject: options.subject });
    throw new Error("Le service d'email n'est pas disponible.");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ERP Sénégal" <no-reply@erp-senegal.com>',
    ...options,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email envoyé avec succès: ${info.messageId}`);

    // Si on est en développement et que l'URL de test existe, on l'affiche
    if (process.env.NODE_ENV !== 'production' && nodemailer.getTestMessageUrl(info)) {
      logger.info(`✨ Prévisualiser l'email (DEV) ici : ${nodemailer.getTestMessageUrl(info)}`);
    }
    
    return info;
  } catch (error) {
    logger.error("Erreur lors de l'envoi de l'email.", { error: error.message });
    throw error;
  }
};

// Lance l'initialisation dès le chargement du module
initializeTransporter();

module.exports = {
  sendEmail,
};