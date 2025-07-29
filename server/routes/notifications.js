// ==============================================================================
//           Routeur pour les Notifications Utilisateur
//           (Préfixe: /api/v1/system/notifications)
//
// Ce fichier définit les routes pour la gestion des notifications personnelles
// de l'utilisateur connecté.
//
// Toutes les routes sont privées et ne nécessitent pas de permissions
// spécifiques au-delà de l'authentification, car un utilisateur ne peut
// interagir qu'avec ses propres notifications.
// ==============================================================================

const express = require('express');

// --- Importation des Contrôleurs et Middlewares ---
const notificationController = require('../controllers/system/notificationController');
const authMiddleware = require('../middleware/auth');

// --- Initialisation du Routeur ---
const router = express.Router();


// --- Application du Middleware d'Authentification ---
// Toutes les routes de ce fichier requièrent que l'utilisateur soit connecté.
router.use(authMiddleware);


// --- Définition des Routes ---

/**
 * @route   GET /api/v1/system/notifications/unread-count
 * @desc    Récupère le nombre de notifications non lues pour l'utilisateur connecté.
 * @access  Privé
 */
router.get(
    '/unread-count',
    notificationController.getUnreadCount
);


/**
 * @route   POST /api/v1/system/notifications/mark-as-read
 * @desc    Marque une ou plusieurs notifications comme lues.
 * @access  Privé
 */
router.post(
    '/mark-as-read',
    notificationController.markAsRead
);


/**
 * @route   GET /api/v1/system/notifications
 * @desc    Récupère la liste paginée des notifications de l'utilisateur connecté.
 * @access  Privé
 */
router.get(
    '/',
    notificationController.getMyNotifications
);


// --- Exportation du Routeur ---
module.exports = router;