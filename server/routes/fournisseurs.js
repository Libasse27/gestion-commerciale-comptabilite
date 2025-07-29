// ==============================================================================
//           Routeur pour les Ressources Fournisseurs (/api/v1/fournisseurs)
//
// Ce fichier définit toutes les routes liées à la gestion des fournisseurs.
// Il utilise les middlewares d'authentification et de permissions pour
// sécuriser chaque point de terminaison.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const fournisseurController = require('../controllers/commercial/fournisseurController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// L'utilisateur doit être connecté pour accéder à n'importe quelle route fournisseur.
router.use(authMiddleware);


// --- Définition des Routes CRUD pour les Fournisseurs ---

// Routes pour la collection de fournisseurs ( / )
router
  .route('/')
  .post(
    checkPermission('create:fournisseur'), // Seuls les utilisateurs avec cette permission peuvent créer
    fournisseurController.createFournisseur
  )
  .get(
    checkPermission('read:fournisseur'), // Seuls les utilisateurs avec cette permission peuvent lister
    fournisseurController.getAllFournisseurs
  );

// Routes pour un document fournisseur spécifique ( /:id )
router
  .route('/:id')
  .get(
    checkPermission('read:fournisseur'),
    fournisseurController.getFournisseurById
  )
  .patch(
    checkPermission('update:fournisseur'),
    fournisseurController.updateFournisseur
  )
  .delete(
    checkPermission('delete:fournisseur'),
    fournisseurController.deleteFournisseur
  );


// --- Exportation du Routeur ---
module.exports = router;