// ==============================================================================
//           Sous-Routeur pour les Écritures Comptables
//           (Préfixe: /api/v1/comptabilite/ecritures)
//
// Ce fichier définit les routes spécifiques aux opérations CRUD et aux actions
// sur les écritures comptables.
//
// Il est conçu pour être "monté" par un routeur parent (ex: `comptabilite.js`),
// ce qui permet une organisation hiérarchique et modulaire des routes.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const ecritureController = require('../controllers/comptabilite/ecritureController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Sous-Routeur ---
// Note : on utilise `mergeParams: true` si on avait besoin d'accéder aux
// paramètres d'une route parente, ex: /journaux/:journalId/ecritures
const router = express.Router({ mergeParams: true });


// --- Application des Middlewares de Sécurité ---
// Ces middlewares s'appliqueront à toutes les routes définies dans ce fichier.
router.use(authMiddleware);


// --- Définition des Routes ---

// Routes pour la collection d'écritures ( / )
router
  .route('/')
  .get(
    checkPermission('read:comptabilite'),
    ecritureController.getAllEcritures
  )
  .post(
    checkPermission('manage:comptabilite'),
    ecritureController.createEcriture
  );

// Routes pour une écriture spécifique ( /:id )
router
  .route('/:id')
  .get(
    checkPermission('read:comptabilite'),
    ecritureController.getEcritureById
  );
  // TODO: Ajouter les routes PATCH et DELETE, protégées par `manage:comptabilite`
  // et qui vérifient que le statut de l'écriture est 'Brouillard'.

// Route d'action pour valider une écriture
router.post(
  '/:id/valider',
  checkPermission('manage:comptabilite'),
  ecritureController.validerEcriture
);


// --- Exportation du Sous-Routeur ---
module.exports = router;