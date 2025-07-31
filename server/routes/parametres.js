// ==============================================================================
//           Routeur pour la Gestion des Paramètres
//           (Préfixe: /api/v1/system/parametres)
//
// Ce fichier définit les routes pour la lecture et la mise à jour des
// paramètres généraux et fiscaux de l'application.
//
// L'accès à ce module est hautement restreint aux administrateurs.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const parametrageController = require('../controllers/system/parametrageController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application des Middlewares de Sécurité Globaux au Routeur ---

// 1. L'utilisateur doit être connecté.
router.use(authMiddleware);

// 2. L'utilisateur doit avoir la permission de gérer les paramètres du système.
router.use(checkPermission('manage:settings'));


// --- Définition des Routes ---

// On utilise une route paramétrée `/:type` pour gérer à la fois les
// paramètres 'general' et 'fiscal' avec les mêmes fonctions de contrôleur.
router
  .route('/:type')
  /**
   * @route   GET /api/v1/system/parametres/:type
   * @desc    Récupère tous les paramètres d'un type donné (general|fiscal).
   * @access  Privé (manage:settings)
   */
  .get(parametrageController.getAllParametres)

  /**
   * @route   PATCH /api/v1/system/parametres/:type
   * @desc    Met à jour un ou plusieurs paramètres d'un type donné.
   * @access  Privé (manage:settings)
   */
  .patch(parametrageController.updateParametres);


// --- Exportation du Routeur ---
module.exports = router;