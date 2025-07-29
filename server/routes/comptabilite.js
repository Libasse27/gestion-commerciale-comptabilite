// ==============================================================================
//           Routeur pour le Module Comptabilité (/api/v1/comptabilite)
//
// MISE À JOUR : Ce routeur gère maintenant les routes de haut niveau pour la
// comptabilité et "monte" le sous-routeur `ecritureRoutes` sur le chemin
// `/ecritures` pour une meilleure organisation.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const comptaController = require('../controllers/comptabilite/comptabiliteController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// 1. Importer le nouveau sous-routeur pour les écritures
const ecritureRoutes = require('./ecritures');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// L'authentification est requise pour tout le module de comptabilité.
router.use(authMiddleware);


// --- Routes de "Haut Niveau" gérées par ce routeur ---

// Routes pour le Plan Comptable
router.route('/plan-comptable')
  .get(
    checkPermission('read:comptabilite'),
    comptaController.getPlanComptable
  )
  .post(
    checkPermission('manage:comptabilite'),
    comptaController.createCompteComptable
  );

// Route pour la Consultation du Grand Livre
router.get(
  '/grand-livre/:compteId',
  checkPermission('read:comptabilite'),
  comptaController.getGrandLivreCompte
);


// --- Montage du Sous-Routeur pour les Écritures ---
// Toutes les routes définies dans `ecritureRoutes` seront maintenant
// préfixées par `/ecritures`.
// Ex: GET / deviendra GET /api/v1/comptabilite/ecritures
router.use('/ecritures', ecritureRoutes);


// --- Exportation du Routeur ---
module.exports = router;