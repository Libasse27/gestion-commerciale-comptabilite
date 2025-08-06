// server/routes/system.js
const express = require('express');
const { protect } = require('../middleware/auth');

// Importer les sous-routeurs
const auditLogRoutes = require('./system/auditLogs');
const backupRoutes = require('./system/backups');
const notificationRoutes = require('./system/notifications');
const parametresRoutes = require('./system/parametres');

const router = express.Router();
router.use(protect); // Sécuriser toutes les routes système

// Brancher les sous-routeurs
router.use('/audit-logs', auditLogRoutes);
router.use('/backups', backupRoutes);
router.use('/notifications', notificationRoutes);
router.use('/parametres', parametresRoutes);

module.exports = router;