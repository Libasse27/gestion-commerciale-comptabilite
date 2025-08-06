const express = require('express');
const kpiController = require('../../controllers/dashboard/kpiController');

const router = express.Router();

router.get('/commerciaux', kpiController.getKpisCommerciaux);
router.get('/tresorerie', kpiController.getKpisTresorerie);

module.exports = router;