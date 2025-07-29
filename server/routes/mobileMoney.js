// ==============================================================================
//           Routeur pour les Transactions Mobile Money
//               (/api/v1/mobile-money)
//
// Ce fichier définit les routes pour l'initiation des paiements via Mobile
// Money et pour la réception des webhooks de confirmation.
//
// Il illustre la gestion d'un mix de routes privées (initiées par l'utilisateur)
// et publiques (initiées par un serveur externe).
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const mobileMoneyController = require('../controllers/paiements/mobileMoneyController');
const authMiddleware = require('../middleware/auth');
// La permission pour initier un paiement pourrait être simple (tout utilisateur connecté)
// ou plus spécifique si nécessaire.

// --- Initialisation du Routeur ---
const router = express.Router();


// =============================================
// --- Section des Routes Privées            ---
// =============================================
// Ces routes sont initiées par le frontend de l'application et requièrent
// que l'utilisateur soit authentifié.

/**
 * @route   POST /api/v1/mobile-money/initiate-wave-payment
 * @desc    Initie une session de paiement avec Wave.
 * @access  Privé
 */
router.post(
    '/initiate-wave-payment',
    authMiddleware, // L'utilisateur doit être connecté pour payer une facture
    mobileMoneyController.initiateWavePayment
);

// TODO: Ajouter des routes similaires pour d'autres opérateurs si nécessaire
// router.post('/initiate-orange-money-payment', authMiddleware, ...);


// =============================================
// --- Section des Routes Publiques (Webhooks) ---
// =============================================
// Ces routes sont appelées par les serveurs des opérateurs de paiement.
// Elles ne peuvent pas être protégées par JWT, leur sécurité repose sur la
// validation de la signature du webhook dans le contrôleur.

/**
 * @route   POST /api/v1/mobile-money/wave-webhook
 * @desc    Point d'entrée pour les notifications (webhooks) de Wave.
 * @access  Public
 */
router.post(
    '/wave-webhook',
    // Note : Pas de `authMiddleware` ici.
    mobileMoneyController.handleWaveWebhook
);

// TODO: Ajouter des routes de webhook pour d'autres opérateurs
// router.post('/orange-money-webhook', ...);


// --- Exportation du Routeur ---
module.exports = router;