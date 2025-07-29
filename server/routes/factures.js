// ==============================================================================
//           Routeur pour les Ressources Factures (/api/v1/factures)
//
// MISE À JOUR : Ajout d'une route pour le téléchargement des factures en PDF.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const factureController = require('../controllers/commercial/factureController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// L'utilisateur doit être connecté pour accéder à toutes les routes de facturation.
router.use(authMiddleware);


// --- Définition des Routes ---

// Route pour lister toutes les factures (GET) et créer une facture directe (POST)
router.route('/')
  .get(checkPermission('read:vente'), factureController.getAllFactures)
  .post(checkPermission('create:vente'), factureController.createFacture);

// Route d'action spécifique pour créer une facture à partir d'une commande
router.post(
  '/from-commande',
  checkPermission('create:vente'),
  factureController.createFactureFromCommande
);

// Routes pour une facture spécifique (par ID)
router.route('/:id')
  .get(checkPermission('read:vente'), factureController.getFactureById);
  // TODO: Ajouter une route PATCH pour la modification (si statut Brouillon)
  // .patch(checkPermission('update:vente'), factureController.updateFacture);

// --- Routes d'Action sur une Facture Spécifique ---

// Nouvelle route pour télécharger le PDF
router.get(
  '/:id/pdf',
  checkPermission('read:vente'), // La permission de lire la facture suffit pour la télécharger
  factureController.downloadFacturePdf
);

// Route pour enregistrer un paiement sur une facture
router.post(
  '/:id/paiements',
  checkPermission('manage:paiement'),
  factureController.addPaiement
);

// Route pour valider/comptabiliser une facture
router.post(
  '/:id/valider',
  checkPermission('validate:vente'),
  factureController.validerFacture
);


// --- Exportation du Routeur ---
module.exports = router;