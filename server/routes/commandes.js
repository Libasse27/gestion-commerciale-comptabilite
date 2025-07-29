// ==============================================================================
//           Routeur pour les Ressources Commandes (/api/v1/commandes)
//
// Ce fichier définit toutes les routes liées à la gestion des commandes clients.
// Il sécurise les endpoints en utilisant les middlewares d'authentification
// et de permissions pour chaque action.
// Il inclut également des routes d'action spécifiques comme la création d'un
// bon de livraison à partir d'une commande.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const commandeController = require('../controllers/commercial/commandeController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Toutes les routes de ce fichier requièrent que l'utilisateur soit connecté.
router.use(authMiddleware);


// --- Définition des Routes CRUD pour les Commandes ---

// Routes pour la collection de commandes ( / )
router
  .route('/')
  .get(
    checkPermission('read:vente'), // Permission de lire les documents de vente
    commandeController.getAllCommandes
  );

// Routes pour un document commande spécifique ( /:id )
router
  .route('/:id')
  .get(
    checkPermission('read:vente'),
    commandeController.getCommandeById
  )
  .patch(
    checkPermission('update:vente'), // Permission de modifier les documents de vente
    commandeController.updateCommande
  );
  // La création d'une commande se fait généralement via la conversion d'un devis
  // La suppression d'une commande peut être implémentée si nécessaire


// --- Routes d'Action Spécifiques ---

// Route pour créer un bon de livraison à partir d'une commande.
// Utilise POST car cette action crée une nouvelle ressource (un BonLivraison).
router.post(
  '/:commandeId/creer-bon-livraison', // URL plus explicite
  checkPermission('create:vente'), // Ou une permission plus spécifique comme 'create:livraison'
  commandeController.createBonLivraisonFromCommande
);


// --- Exportation du Routeur ---
module.exports = router;