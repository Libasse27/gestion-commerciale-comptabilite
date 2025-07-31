// ==============================================================================
//                    Configuration du Service d'Envoi d'Emails
//
// Ce module configure Nodemailer pour l'envoi d'emails. Il gère deux cas :
//
// - En mode 'production', il utilise un véritable transporteur SMTP configuré
//   via les variables d'environnement (recommandé: SendGrid, Mailgun, etc.).
//
// - En mode 'development', il utilise Ethereal.email, un service qui crée
//   une fausse boîte de réception. Cela permet de tester l'envoi d'emails
//   sans envoyer de vrais courriels. Un lien de prévisualisation s'affichera
//   dans la console.
//
// La configuration (host, user, pass) DOIT être stockée dans le fichier .env.
// ==============================================================================

const nodemailer = require('nodemailer');

let transporter;

/**
 * Initialise le transporteur Nodemailer en fonction de l'environnement.
 */
const initializeTransporter = async () => {
  if (process.env.NODE_ENV === 'production') {
    // --- Configuration pour la PRODUCTION ---
    // Utilise un service d'email transactionnel (SendGrid, Mailgun, Brevo, etc.)
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
      console.error('❌ Erreur: Les variables d\'environnement SMTP pour la production ne sont pas définies.');
      return; // Ne pas initialiser le transporter si la config est manquante
    }
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: (process.env.SMTP_PORT || 587) == 465, // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  } else {
    // --- Configuration pour le DÉVELOPPEMENT ---
    // Utilise un compte de test Ethereal
    try {
      const testAccount = await nodemailer.createTestAccount();
      transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user, // Identifiant généré
          pass: testAccount.pass, // Mot de passe généré
        },
      });
      console.log('📬 Transporteur d\'emails (mode DEV) initialisé. Emails visibles sur Ethereal.');
    } catch (error) {
      console.error('❌ Erreur lors de la création du compte de test Ethereal:', error);
      return;
    }
  }

  // Vérifier la connexion au serveur SMTP (optionnel mais recommandé)
  try {
    await transporter.verify();
    console.log('✅ Le serveur d\'emails est prêt à recevoir des messages.');
  } catch (error) {
    console.error('❌ Erreur lors de la vérification du transporteur d\'emails:', error);
  }
};

/**
 * Envoie un email en utilisant le transporteur configuré.
 * @param {object} options - Options de l'email.
 * @param {string} options.to - Le ou les destinataires (séparés par une virgule pour plusieurs).
 * @param {string} options.subject - Le sujet de l'email.
 * @param {string} options.text - La version texte brut de l'email.
 * @param {string} options.html - La version HTML de l'email.
 * @returns {Promise<void>}
 */
const sendEmail = async (options) => {
  if (!transporter) {
    console.error("Le transporteur d'emails n'est pas initialisé. L'email n'a pas été envoyé.");
    // Dans un cas réel, on pourrait vouloir retourner une erreur plus explicite
    throw new Error("Email service not available.");
  }

  const mailOptions = {
    from: process.env.EMAIL_FROM || '"ERP Sénégal" <no-reply@erp-senegal.com>',
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
    // attachments: options.attachments // Pour les pièces jointes
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email envoyé: ${info.messageId}`);

    // Si on est en mode développement, afficher le lien de prévisualisation
    if (process.env.NODE_ENV !== 'production') {
      console.log(`✨ Prévisualiser l'email: ${nodemailer.getTestMessageUrl(info)}`);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi de l'email:", error);
    // Propager l'erreur pour que le code appelant puisse la gérer
    throw error;
  }
};

// Initialiser le transporteur au démarrage de l'application
// L'appel est asynchrone mais on ne le "await" pas ici pour ne pas bloquer
// le démarrage du serveur.
initializeTransporter();

module.exports = {
  sendEmail
};