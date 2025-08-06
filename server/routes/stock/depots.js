const express = require('express');
const depotController = require('../../controllers/stock/depotController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();
router.use(checkPermission('stock:manage'));

router.route('/')
    .post(depotController.createDepot)
    .get(depotController.getAllDepots);

router.route('/:id')
    .get(depotController.getDepotById)
    .patch(depotController.updateDepot)
    .delete(depotController.deleteDepot);

module.exports = router;