// ==============================================================================
//           Routeur pour les Informations de l'Entreprise
//           (Préfixe: /api/v1/system/entreprise)
//
// Ce fichier définit les routes pour la lecture et la mise à jour des
// informations de l'entreprise.
//
// L'accès est restreint : la lecture peut être autorisée à plusieurs rôles,
// mais la modification est réservée aux administrateurs.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const entrepriseController = require('../controllers/system/entrepriseController');
const authMiddleware = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// L'utilisateur doit être connecté pour accéder à ces informations.
router.use(authMiddleware);


// --- Définition des Routes ---

// On utilise `.route('/')` pour regrouper les méthodes GET et PUT sur la même URL
router
  .route('/')
  /**
   * @route   GET /api/v1/system/entreprise
   * @desc    Récupère les informations de l'entreprise.
   * @access  Privé (read:comptabilite ou autre permission de lecture)
   */
  .get(
    // Une permission de lecture assez large est acceptable ici
    checkPermission('read:comptabilite'),
    entrepriseController.getInformationsEntreprise
  )
  /**
   * @route   PUT /api/v1/system/entreprise
   * @desc    Crée ou met à jour les informations de l'entreprise.
   * @access  Privé (manage:settings)
   */
  .put(
    // La mise à jour est une action d'administration de haut niveau
    checkPermission('manage:settings'),
    entrepriseController.updateInformationsEntreprise
  );


// --- Exportation du Routeur ---
module.exports = router;