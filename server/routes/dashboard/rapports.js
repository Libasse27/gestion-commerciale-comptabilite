const express = require('express');
const rapportController = require('../../controllers/dashboard/rapportController');

const router = express.Router();

router.get('/ventes', rapportController.getRapportVentes);
router.get('/balance-generale', rapportController.getBalanceGenerale);
router.get('/bilan', rapportController.getBilan);
router.get('/declaration-tva', rapportController.getDeclarationTVA);

module.exports = router;