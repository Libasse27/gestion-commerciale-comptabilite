// ==============================================================================
//           Contrôleur pour la Gestion des Notifications Utilisateur
//
// Ce contrôleur gère les requêtes HTTP pour la consultation et la gestion
// des notifications internes de l'utilisateur connecté.
// ==============================================================================

const Notification = require('../../models/system/Notification');
const notificationService = require('../../services/notifications/notificationService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Récupérer les notifications de l'utilisateur connecté
 * @route   GET /api/v1/system/notifications
 * @access  Privé
 */
exports.getMyNotifications = asyncHandler(async (req, res, next) => {
  // Récupérer les options de pagination et de filtrage
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  
  const filter = { destinataire: req.user.id };
  if (req.query.statut) { // Permet de filtrer par "Lue" ou "Non lue"
      filter.statut = req.query.statut;
  }
  
  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 }) // Les plus récentes d'abord
    .skip(skip)
    .limit(limit);

  const total = await Notification.countDocuments(filter);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    data: {
      notifications,
      pagination: {
          total,
          limit,
          page,
          pages: Math.ceil(total / limit),
      }
    },
  });
});


/**
 * @desc    Compter les notifications non lues de l'utilisateur connecté
 * @route   GET /api/v1/system/notifications/unread-count
 * @access  Privé
 */
exports.getUnreadCount = asyncHandler(async (req, res, next) => {
    const count = await Notification.countDocuments({
        destinataire: req.user.id,
        statut: 'Non lue',
    });
    
    res.status(200).json({
        status: 'success',
        data: {
            count,
        }
    });
});


/**
 * @desc    Marquer des notifications comme lues
 * @route   POST /api/v1/system/notifications/mark-as-read
 * @access  Privé
 */
exports.markAsRead = asyncHandler(async (req, res, next) => {
  // Le corps de la requête peut contenir un tableau d'IDs.
  // S'il est vide, on marque toutes les notifications comme lues.
  const { ids } = req.body;
  
  const result = await notificationService.markNotificationsAsRead(req.user.id, ids);

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} notification(s) marquée(s) comme lue(s).`,
    data: result,
  });
});