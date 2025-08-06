const express = require('express');
const relanceController = require('../../controllers/paiements/relanceController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();

router.route('/')
    .get(checkPermission('comptabilite:read'), relanceController.getAllRelances);

router.get('/facture/:factureId', checkPermission('comptabilite:read'), relanceController.getRelancesByFacture);

router.post('/run-job', checkPermission('paiement:manage'), relanceController.runAutomatedRemindersJob);

module.exports = router;