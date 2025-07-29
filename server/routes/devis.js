// ==============================================================================
//           Routeur pour les Ressources Devis (/api/v1/devis)
//
// Ce fichier définit toutes les routes liées à la gestion des devis.
// Il sécurise les endpoints en utilisant les middlewares d'authentification
// et de permissions pour chaque action.
// Il inclut également des routes d'action spécifiques comme la conversion
// d'un devis en commande.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const devisController = require('../controllers/commercial/devisController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Toutes les routes de ce fichier requièrent que l'utilisateur soit connecté.
router.use(authMiddleware);


// --- Définition des Routes CRUD pour les Devis ---

// Routes pour la collection de devis ( / )
router
  .route('/')
  .post(
    checkPermission('create:vente'), // Permission de créer des documents de vente
    devisController.createDevis
  )
  .get(
    checkPermission('read:vente'), // Permission de lire les documents de vente
    devisController.getAllDevis
  );

// Routes pour un document devis spécifique ( /:id )
router
  .route('/:id')
  .get(
    checkPermission('read:vente'),
    devisController.getDevisById
  )
  .patch(
    checkPermission('update:vente'),
    devisController.updateDevis
  );
  // .delete(checkPermission('delete:vente'), devisController.deleteDevis); // A implémenter si besoin


// --- Routes d'Action Spécifiques ---

// Route pour convertir un devis en commande.
// Utilise POST car cette action crée une nouvelle ressource (une Commande).
router.post(
  '/:id/convertir-en-commande', // URL plus explicite
  checkPermission('create:vente'), // La même permission que pour créer un devis/commande
  devisController.convertToCommande
);


// --- Exportation du Routeur ---
module.exports = router;