const express = require('express');
const parametrageController = require('../../controllers/system/parametrageController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();
router.use(checkPermission('system:manage'));

router.route('/')
    .get(parametrageController.getAllParametres)
    .patch(parametrageController.updateParametres);

module.exports = router;