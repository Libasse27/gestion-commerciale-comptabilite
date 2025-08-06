const express = require('express');
const alerteController = require('../../controllers/stock/alerteController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();

router.route('/')
    .get(checkPermission('stock:read'), alerteController.getAllAlertes);

router.route('/:id')
    .get(checkPermission('stock:read'), alerteController.getAlerteById)
    .patch(checkPermission('stock:manage'), alerteController.updateAlerteStatut);

module.exports = router;