const express = require('express');
const backupController = require('../../controllers/system/backupController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();
router.use(checkPermission('system:manage')); // Seuls les admins peuvent gérer les backups

router.route('/')
    .get(backupController.getBackupHistory);

router.post('/trigger', backupController.triggerBackup);
router.get('/:id/download', backupController.downloadBackup);

module.exports = router;