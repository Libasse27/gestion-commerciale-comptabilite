// ==============================================================================
//           Routeur pour les Échéanciers de Paiement (/api/v1/echeanciers)
//
// Ce fichier définit les routes pour la gestion des échéanciers.
// Il sécurise les endpoints en distinguant les permissions de lecture
// des permissions de gestion.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const echeancierController = require('../controllers/paiements/echeancierController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Toutes les routes de ce fichier requièrent que l'utilisateur soit connecté.
router.use(authMiddleware);


// --- Définition des Routes ---

/**
 * @route   POST /api/v1/echeanciers
 * @desc    Crée un nouvel échéancier pour une facture.
 * @access  Privé (manage:paiement)
 */
router.post(
    '/',
    checkPermission('manage:paiement'),
    echeancierController.createEcheancier
);

/**
 * @route   GET /api/v1/echeanciers/facture/:factureId
 * @desc    Récupère l'échéancier associé à une facture spécifique.
 * @access  Privé (read:comptabilite)
 */
router.get(
    '/facture/:factureId',
    checkPermission('read:comptabilite'),
    echeancierController.getEcheancierByFacture
);

/**
 * @route   PATCH /api/v1/echeanciers/:id
 * @desc    Met à jour un échéancier.
 * @access  Privé (manage:paiement)
 */
router.patch(
    '/:id',
    checkPermission('manage:paiement'),
    echeancierController.updateEcheancier
);

/**
 * @route   DELETE /api/v1/echeanciers/:id
 * @desc    Annule (suppression logique) un échéancier.
 * @access  Privé (manage:paiement)
 */
router.delete(
    '/:id',
    checkPermission('manage:paiement'),
    echeancierController.deleteEcheancier
);


// --- Alternative avec .route() pour regrouper ---
/*
router.route('/:id')
    .patch(checkPermission('manage:paiement'), echeancierController.updateEcheancier)
    .delete(checkPermission('manage:paiement'), echeancierController.deleteEcheancier);
*/


// --- Exportation du Routeur ---
module.exports = router;