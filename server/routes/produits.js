// ==============================================================================
//           Routeur pour les Ressources Produits (/api/v1/produits)
//
// Ce fichier définit toutes les routes liées à la gestion du catalogue de
// produits et services.
//
// Il sécurise les endpoints en s'assurant que l'utilisateur est authentifié,
// puis en vérifiant ses permissions spécifiques pour chaque action (lecture,
// gestion).
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const produitController = require('../controllers/commercial/produitController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Toutes les routes de ce fichier requièrent que l'utilisateur soit connecté.
router.use(authMiddleware);


// --- Définition des Routes CRUD pour les Produits ---

// Routes pour la collection de produits ( / )
router
  .route('/')
  .post(
    // Seuls les utilisateurs avec la permission de gérer le catalogue peuvent créer un produit
    checkPermission('manage:produit'),
    produitController.createProduit
  )
  .get(
    // La plupart des utilisateurs connectés peuvent avoir le droit de lire le catalogue
    checkPermission('read:produit'),
    produitController.getAllProduits
  );

// Routes pour un document produit spécifique ( /:id )
router
  .route('/:id')
  .get(
    checkPermission('read:produit'),
    produitController.getProduitById
  )
  .patch(
    checkPermission('manage:produit'),
    produitController.updateProduit
  )
  .delete(
    checkPermission('manage:produit'),
    produitController.deleteProduit
  );


// --- Exportation du Routeur ---
module.exports = router;