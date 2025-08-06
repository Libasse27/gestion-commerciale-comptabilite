// server/controllers/paiements/mobileMoneyController.js
const mobileMoneyService = require('../../services/paiements/mobileMoneyService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const { logger } = require('../../middleware/logger');

/**
 * @desc    Initier une session de paiement avec Wave
 * @route   POST /api/v1/paiements/mobile-money/initiate-wave
 */
exports.initiateWavePayment = asyncHandler(async (req, res, next) => {
  const { montant, factureId, redirectUrl } = req.body;
  if (!montant || !factureId || !redirectUrl) {
    return next(new AppError('Les champs montant, factureId et redirectUrl sont requis.', 400));
  }
  
  const resultat = await mobileMoneyService.initierPaiementWave({ montant, factureId, redirectUrl });

  res.status(200).json({ status: 'success', data: resultat });
});

/**
 * @desc    Gérer les webhooks entrants de Wave
 * @route   POST /api/v1/paiements/mobile-money/webhook/wave
 */
exports.handleWaveWebhook = asyncHandler(async (req, res, next) => {
    logger.info('Webhook Wave reçu.');
    
    // TODO: Implémenter la vérification de la signature du webhook en production.
    // const signature = req.headers['wave-signature'];
    // await mobileMoneyService.verifyAndHandleWebhook(req.body, signature);
    
    // Pour le développement, on traite directement le payload.
    await mobileMoneyService.handleWaveWebhook(req.body);

    res.status(200).json({ received: true });
});