const express = require('express');
const notificationController = require('../../controllers/system/notificationController');

const router = express.Router();
// Ces routes sont centrées sur l'utilisateur connecté, pas besoin de permission spécifique.

router.get('/', notificationController.getMyNotifications);
router.get('/unread-count', notificationController.getUnreadCount);
router.post('/mark-as-read', notificationController.markAsRead);

module.exports = router;