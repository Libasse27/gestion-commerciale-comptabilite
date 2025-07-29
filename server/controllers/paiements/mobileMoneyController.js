// ==============================================================================
//           Contrôleur pour les Transactions Mobile Money
//
// Ce contrôleur gère les requêtes HTTP pour l'initiation des paiements
// via Mobile Money et pour la réception des webhooks de confirmation
// envoyés par les opérateurs de paiement.
// ==============================================================================

const mobileMoneyService = require('../../services/paiements/mobileMoneyService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const { logger } = require('../../middleware/logger');

/**
 * @desc    Initier une session de paiement avec un opérateur (ex: Wave)
 * @route   POST /api/v1/mobile-money/initiate-wave-payment
 * @access  Privé
 */
exports.initiateWavePayment = asyncHandler(async (req, res, next) => {
  const { montant, factureId, redirectUrl } = req.body;

  if (!montant || !factureId || !redirectUrl) {
    return next(new AppError('Les champs montant, factureId et redirectUrl sont requis.', 400));
  }
  
  const resultat = await mobileMoneyService.initierPaiementWave({
      montant,
      factureId,
      redirectUrl,
  });

  // On renvoie l'URL de paiement au frontend pour qu'il puisse y rediriger l'utilisateur
  res.status(200).json({
    status: 'success',
    data: resultat, // Contient { checkoutUrl, transactionId }
  });
});


/**
 * @desc    Gérer les webhooks entrants de l'opérateur Wave
 * @route   POST /api/v1/mobile-money/wave-webhook
 * @access  Public (sécurisé par une vérification de signature)
 */
exports.handleWaveWebhook = asyncHandler(async (req, res, next) => {
    logger.info('Webhook Wave reçu...');
    
    // --- Étape de Sécurité Cruciale (à implémenter) ---
    // Avant de faire quoi que ce soit, vous devez vérifier que la requête
    // vient bien de Wave et non d'un acteur malveillant.
    // Chaque opérateur fournit un mécanisme pour cela (ex: une signature dans les en-têtes).
    // const signature = req.headers['wave-signature'];
    // const isVerified = mobileMoneyService.verifyWaveSignature(req.body, signature);
    // if (!isVerified) {
    //     logger.warn('Webhook Wave reçu avec une signature invalide.');
    //     return next(new AppError('Signature invalide.', 400));
    // }

    // Déléguer le traitement du payload du webhook au service
    await mobileMoneyService.handleWaveWebhook(req.body);

    // Répondre immédiatement à l'opérateur avec un statut 200 pour
    // accuser réception. Ne pas le faire attendre la fin de votre
    // traitement interne.
    res.status(200).json({ received: true });
});


// TODO: Ajouter des contrôleurs similaires pour d'autres opérateurs (Orange Money, etc.)