const axios = require('axios');
const MobileMoneyTransaction = require('../../models/paiements/MobileMoneyTransaction');
const Facture = require('../../models/commercial/Facture');
const paiementService = require('./paiementService');
const parametrageService = require('../system/parametrageService');
const AppError = require('../../utils/appError');
const { logger } = require('../../middleware/logger');

// À remplacer par la véritable URL de l'API Wave
const waveApiClient = axios.create({
  baseURL: 'https://api.wave.com/v1', 
  headers: {
    'Authorization': `Bearer ${process.env.WAVE_API_KEY}`,
    'Content-Type': 'application/json',
  }
});

async function initierPaiementWave({ montant, factureId, redirectUrl }) {
  try {
    // Simuler la réponse de l'API pour le développement
    const transactionId = `wave_tx_${new Date().getTime()}`;
    const checkoutUrl = `${redirectUrl}?transaction_id=${transactionId}&status=success`; // Simuler succès

    await MobileMoneyTransaction.create({
      transactionId, operateur: 'Wave', type: 'PaiementClient', montant,
      statutOperateur: 'INITIEE', metadata: { internalInvoiceId: factureId }
    });

    logger.info(`Session de paiement Wave (simulée) initiée: ${transactionId}`);
    return { checkoutUrl, transactionId };
  } catch (error) {
    logger.error("Erreur lors de l'initiation du paiement Wave", { error: error.message });
    throw new AppError("Impossible d'initier le paiement.", 500);
  }
}

async function handleWaveWebhook(webhookPayload, signature) {
  // TODO: Vérifier la signature du webhook en production
  
  const { type: eventType, data } = webhookPayload;
  
  if (eventType === 'checkout.session.completed') {
    const transactionId = data.object.id;
    
    const transaction = await MobileMoneyTransaction.findOne({ transactionId });
    if (!transaction || transaction.statutOperateur === 'REUSSIE') {
      return; 
    }
    
    const facture = await Facture.findById(transaction.metadata.internalInvoiceId).lean();
    if (!facture) {
      transaction.statutOperateur = 'ECHOUEE';
      transaction.metadata.error = 'Facture interne introuvable.';
      await transaction.save();
      return;
    }

    try {
        const params = await parametrageService.getAllParametres();
        
        const paiement = await paiementService.enregistrerEncaissementClient({
            clientId: facture.client, montant: transaction.montant, datePaiement: new Date(),
            modePaiementId: params.MODE_PAIEMENT_WAVE_ID, compteTresorerieId: params.COMPTE_TRESORERIE_WAVE_ID,
            imputations: [{ factureId: facture._id, montantImpute: transaction.montant }],
        }, null);

        transaction.statutOperateur = 'REUSSIE';
        transaction.paiementInterne = paiement._id;
        transaction.metadata.apiResponse = data.object;
        await transaction.save();
        
        logger.info(`Paiement Wave finalisé pour la transaction: ${transactionId}`);
    } catch (error) {
        logger.error(`Erreur lors de la finalisation du paiement Wave ${transactionId}`, { error: error.message });
        transaction.statutOperateur = 'ECHOUEE';
        transaction.metadata.error = `Erreur interne: ${error.message}`;
        await transaction.save();
    }
  }
}

module.exports = { initierPaiementWave, handleWaveWebhook };