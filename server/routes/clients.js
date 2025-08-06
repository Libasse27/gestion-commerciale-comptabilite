// server/routes/clients.js
const express = require('express');
const clientController = require('../controllers/commercial/clientController');
const { protect } = require('../middleware/auth'); // Renommé en 'protect' pour la clarté
const { checkPermission } = require('../middleware/permissions');
// Importer les validateurs si nécessaire
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Appliquer le middleware d'authentification à toutes les routes de ce fichier
router.use(protect);

// Route d'export
router.get(
    '/export/excel',
    checkPermission('client:read'),
    clientController.exportClients
);

// Routes pour la collection /
router.route('/')
  .post(
    checkPermission('client:create'),
    [ // Ajouter la validation ici
        body('nom', 'Le nom du client est obligatoire.').not().isEmpty().trim(),
        body('email', 'Veuillez fournir un email valide.').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    ],
    handleValidationErrors,
    clientController.createClient
  )
  .get(
    checkPermission('client:read'),
    clientController.getAllClients
  );

// Routes pour un document spécifique /:id
router.route('/:id')
  .get(
    checkPermission('client:read'),
    clientController.getClientById
  )
  .patch(
    checkPermission('client:update'),
    clientController.updateClient
  )
  .delete(
    checkPermission('client:delete'),
    clientController.deleteClient
  );

module.exports = router;