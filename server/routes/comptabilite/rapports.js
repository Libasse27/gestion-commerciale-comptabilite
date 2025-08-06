const express = require('express');
const rapportController = require('../../controllers/comptabilite/rapportController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();
router.use(checkPermission('comptabilite:read'));

router.get('/balance', rapportController.genererBalance);
router.get('/bilan', rapportController.genererBilan);
router.get('/compte-de-resultat', rapportController.genererCompteDeResultat);

module.exports = router;