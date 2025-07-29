// ==============================================================================
//           Routeur pour les Ressources Clients (/api/v1/clients)
//
// MISE À JOUR : Ajout d'une route spécifique pour l'export des données au
// format Excel.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const clientController = require('../controllers/commercial/clientController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification Global au Routeur ---
router.use(authMiddleware);


// --- Définition des Routes ---

// Routes pour la collection ( / )
router
  .route('/')
  .post(
    checkPermission('create:client'),
    clientController.createClient
  )
  .get(
    checkPermission('read:client'),
    clientController.getAllClients
  );

// --- Route d'Action Spécifique : Export ---
// Cette route doit être déclarée AVANT la route générique '/:id' pour être
// correctement interceptée par Express.
router.get(
    '/export/excel',
    checkPermission('read:client'), // La permission de lire les clients suffit pour les exporter
    clientController.exportClients
);

// Routes pour un document spécifique ( /:id )
router
  .route('/:id')
  .get(
    checkPermission('read:client'),
    clientController.getClientById
  )
  .patch(
    checkPermission('update:client'),
    clientController.updateClient
  )
  .delete(
    checkPermission('delete:client'),
    clientController.deleteClient
  );


// --- Exportation du Routeur ---
module.exports = router;