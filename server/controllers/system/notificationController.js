// server/controllers/system/notificationController.js
const Notification = require('../../models/system/Notification');
const notificationService = require('../../services/notifications/notificationService');
const asyncHandler = require('../../utils/asyncHandler');

exports.getMyNotifications = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;
  
  const filter = { destinataire: req.user.id };
  if (req.query.statut) {
      filter.statut = req.query.statut;
  }
  
  const notificationsPromise = Notification.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();
    
  const totalPromise = Notification.countDocuments(filter);
  const [notifications, total] = await Promise.all([notificationsPromise, totalPromise]);

  res.status(200).json({
    status: 'success',
    results: notifications.length,
    pagination: {
        total,
        limit,
        page,
        pages: Math.ceil(total / limit),
    },
    data: { notifications },
  });
});

exports.getUnreadCount = asyncHandler(async (req, res, next) => {
    const count = await Notification.countDocuments({
        destinataire: req.user.id,
        statut: 'Non lue',
    });
    res.status(200).json({ status: 'success', data: { count } });
});

exports.markAsRead = asyncHandler(async (req, res, next) => {
  // Le corps peut être vide (tout marquer) ou contenir un tableau d'IDs
  const { ids } = req.body;
  const result = await notificationService.markNotificationsAsRead(req.user.id, ids);

  res.status(200).json({
    status: 'success',
    message: `${result.modifiedCount} notification(s) marquée(s) comme lue(s).`,
    data: result,
  });
});