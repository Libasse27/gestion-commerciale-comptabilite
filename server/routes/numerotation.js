// ==============================================================================
//           Routeur pour la Gestion de la Numérotation
//           (Préfixe: /api/v1/system/numerotation)
//
// Ce fichier définit les routes CRUD pour la gestion des configurations
// de numérotation des documents.
//
// L'accès à ce module est hautement restreint aux administrateurs.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const numerotationController = require('../controllers/system/numerotationController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté.
router.use(authMiddleware);

// 2. L'utilisateur doit avoir la permission de gérer les paramètres du système.
router.use(checkPermission('manage:settings'));


// --- Définition des Routes CRUD ---

// Routes pour la collection ( / )
router
  .route('/')
  .get(numerotationController.getAllNumerotations)
  .post(numerotationController.createNumerotation);

// Routes pour un document spécifique ( /:id )
router
  .route('/:id')
  .get(numerotationController.getNumerotationById)
  .patch(numerotationController.updateNumerotation);
  // La suppression (DELETE) d'une configuration de numérotation est une action
  // potentiellement dangereuse (elle pourrait casser la création de futurs documents).
  // Il est souvent plus sûr de ne pas l'exposer via l'API, ou de la remplacer
  // par une action de "désactivation" si nécessaire.


// --- Exportation du Routeur ---
module.exports = router;