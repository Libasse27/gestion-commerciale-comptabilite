// ==============================================================================
//           Routeur pour la Gestion des Paiements (/api/v1/paiements)
//
// Ce fichier définit les routes pour l'enregistrement et la consultation des
// transactions financières (encaissements et décaissements).
//
// Il sécurise les endpoints en distinguant les permissions de lecture
// (`read:comptabilite`) des permissions de gestion (`manage:paiement`).
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const paiementController = require('../controllers/paiements/paiementController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Toutes les routes de ce fichier requièrent que l'utilisateur soit connecté.
router.use(authMiddleware);


// --- Définition des Routes ---

// Route pour lister tous les paiements
router.get(
  '/',
  checkPermission('read:comptabilite'),
  paiementController.getAllPaiements
);

// Route pour récupérer un paiement spécifique par son ID
router.get(
  '/:id',
  checkPermission('read:comptabilite'),
  paiementController.getPaiementById
);

// --- Routes d'Action ---

// Route pour enregistrer un nouvel encaissement client
router.post(
  '/encaissements',
  checkPermission('manage:paiement'), // Requiert une permission de gestion
  paiementController.createEncaissement
);

// Route pour enregistrer un nouveau décaissement fournisseur
router.post(
  '/decaissements',
  checkPermission('manage:paiement'),
  paiementController.createDecaissement
);


// --- Exportation du Routeur ---
module.exports = router;