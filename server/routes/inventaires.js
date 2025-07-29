// ==============================================================================
//           Routeur pour le Processus d'Inventaire (/api/v1/stock/inventaires)
//
// Ce fichier définit les routes pour le cycle de vie complet d'un inventaire.
//
// Il sécurise les endpoints en distinguant les permissions de lecture
// (`read:stock`) des permissions de gestion/modification (`manage:stock`).
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const inventaireController = require('../controllers/stock/inventaireController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Toutes les routes de ce fichier requièrent que l'utilisateur soit connecté.
router.use(authMiddleware);


// --- Définition des Routes ---

// Route pour lister tous les inventaires et en démarrer un nouveau
router
  .route('/')
  .get(
    checkPermission('read:stock'),
    inventaireController.getAllInventaires
  )
  .post(
    checkPermission('manage:stock'),
    inventaireController.startInventaire
  );

// Route pour récupérer un inventaire spécifique par son ID
router.get(
  '/:id',
  checkPermission('read:stock'),
  inventaireController.getInventaireById
);

// Route d'action pour ajouter/modifier une ligne à un inventaire en cours
router.post(
  '/:id/lignes',
  checkPermission('manage:stock'),
  inventaireController.addInventaireLine
);

// Route d'action pour valider un inventaire
router.post(
  '/:id/valider',
  checkPermission('manage:stock'),
  inventaireController.validateInventaire
);


// --- Exportation du Routeur ---
module.exports = router;