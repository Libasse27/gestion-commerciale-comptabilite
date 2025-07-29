// ==============================================================================
//           Routeur pour les Alertes de Stock (/api/v1/stock/alertes)
//
// Ce fichier définit les routes pour la consultation et la gestion des alertes
// de stock.
//
// Toutes les routes sont protégées et requièrent des permissions spécifiques
// pour la lecture ou la gestion des alertes.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const alerteController = require('../controllers/stock/alerteController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Toutes les routes de ce fichier requièrent que l'utilisateur soit connecté.
router.use(authMiddleware);


// --- Définition des Routes ---

// Route pour lister toutes les alertes (peut être filtrée par statut via query params)
router.get(
  '/',
  checkPermission('read:stock'), // Permission de consulter l'état du stock
  alerteController.getAllAlertes
);

// Route pour récupérer une alerte spécifique par son ID
router.get(
  '/:id',
  checkPermission('read:stock'),
  alerteController.getAlerteById
);

// Route pour mettre à jour le statut d'une alerte (la marquer comme résolue/ignorée)
router.patch(
  '/:id',
  checkPermission('manage:stock'), // Permission plus élevée pour gérer le stock
  alerteController.updateAlerteStatut
);


// --- Exportation du Routeur ---
module.exports = router;