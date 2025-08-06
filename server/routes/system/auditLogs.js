const express = require('express');
const auditLogController = require('../../controllers/system/auditLogController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();

router.get('/', checkPermission('system:read'), auditLogController.getAllAuditLogs);

module.exports = router;