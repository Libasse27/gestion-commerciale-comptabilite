// ==============================================================================
//           Service pour l'Intégration des API Mobile Money
//
// Ce service agit comme une couche d'abstraction pour communiquer avec les
// API externes des opérateurs de paiement mobile (Wave, Orange Money, etc.).
//
// Il est responsable de :
//   - L'initiation des demandes de paiement.
//   - Le suivi des transactions dans notre modèle `MobileMoneyTransaction`.
//   - La gestion des webhooks pour finaliser les paiements.
// ==============================================================================

const axios = require('axios');
const MobileMoneyTransaction = require('../../models/paiements/MobileMoneyTransaction');
const paiementService = require('./paiementService');
const AppError = require('../../utils/appError');
const { logger } = require('../../middleware/logger');

// --- Configuration (devrait venir des variables d'environnement) ---
const WAVE_API_BASE_URL = 'https://api.wave.com/v1'; // URL fictive
const WAVE_API_KEY = process.env.WAVE_API_KEY;

// Création d'une instance Axios dédiée à l'API de Wave
const waveApiClient = axios.create({
  baseURL: WAVE_API_BASE_URL,
  headers: {
    'Authorization': `Bearer ${WAVE_API_KEY}`,
    'Content-Type': 'application/json',
  }
});


/**
 * Initie une demande de paiement via l'API de Wave.
 * @param {object} data
 * @param {number} data.montant - Le montant à payer.
 * @param {string} data.factureId - L'ID de la facture interne à payer.
 * @param {string} data.redirectUrl - L'URL où rediriger l'utilisateur après le paiement.
 * @returns {Promise<{checkoutUrl: string, transactionId: string}>} L'URL de paiement et l'ID de la transaction.
 */
async function initierPaiementWave({ montant, factureId, redirectUrl }) {
  try {
    // 1. Appeler l'API de Wave pour créer une session de paiement
    const response = await waveApiClient.post('/checkout/sessions', {
      amount: montant,
      currency: 'XOF',
      success_url: redirectUrl,
      cancel_url: `${redirectUrl}?status=cancelled`,
      // On passe l'ID de notre facture en métadonnée pour la réconciliation
      metadata: {
        internalInvoiceId: factureId,
      }
    });

    const { id: transactionId, checkout_url: checkoutUrl } = response.data;

    // 2. Créer un enregistrement de trace dans notre base de données
    await MobileMoneyTransaction.create({
      transactionId,
      operateur: 'Wave',
      type: 'PaiementClient',
      montant,
      statutOperateur: 'INITIEE',
      metadata: {
          internalInvoiceId: factureId
      }
    });

    logger.info(`Session de paiement Wave initiée avec l'ID: ${transactionId}`);
    return { checkoutUrl, transactionId };

  } catch (error) {
    logger.error("Erreur lors de l'initiation du paiement Wave", { error: error.response?.data || error.message });
    throw new AppError('Impossible d\'initier le paiement avec le service externe.', 500);
  }
}


/**
 * Gère le webhook reçu de Wave pour finaliser une transaction.
 * @param {object} webhookPayload - Le corps de la requête du webhook.
 * @returns {Promise<void>}
 */
async function handleWaveWebhook(webhookPayload) {
  // TODO: Vérifier la signature du webhook pour s'assurer qu'il vient bien de Wave.
  
  const eventType = webhookPayload.type;
  const data = webhookPayload.data.object;
  
  if (eventType === 'checkout.session.completed') {
    const transactionId = data.id;
    
    // 1. Retrouver notre transaction de trace
    const transaction = await MobileMoneyTransaction.findOne({ transactionId });
    if (!transaction || transaction.statutOperateur === 'REUSSIE') {
      // Si la transaction n'existe pas ou a déjà été traitée, on arrête.
      logger.warn(`Webhook reçu pour une transaction Wave inconnue ou déjà traitée: ${transactionId}`);
      return;
    }
    
    // 2. Mettre à jour notre trace
    transaction.statutOperateur = 'REUSSIE';
    transaction.metadata = data; // Stocker toute la réponse
    
    // 3. Appeler le `paiementService` pour créer le paiement interne
    // On récupère les informations nécessaires depuis la transaction ou les métadonnées
    const factureId = transaction.metadata.internalInvoiceId;
    const client = (await Facture.findById(factureId)).client; // Exemple
    const compteTresorerie = 'ID_COMPTE_TRESORERIE_WAVE'; // À récupérer depuis les paramètres
    
    const paiement = await paiementService.enregistrerEncaissementClient({
        clientId: client,
        montant: transaction.montant,
        datePaiement: new Date(),
        modePaiementId: 'ID_MODE_PAIEMENT_WAVE', // À récupérer depuis les paramètres
        compteTresorerieId: compteTresorerie,
        imputations: [{ factureId, montantImpute: transaction.montant }],
        reference: `WAVE-${transactionId}`,
    }, null); // `null` car l'action est initiée par le système/webhook

    // 4. Lier le paiement interne à notre trace
    transaction.paiementInterne = paiement._id;
    await transaction.save();
    
    logger.info(`Paiement Wave finalisé et enregistré pour la transaction: ${transactionId}`);
  }
  
  // Gérer d'autres types d'événements (ex: 'checkout.session.async_payment_failed')
}


module.exports = {
  initierPaiementWave,
  handleWaveWebhook,
};