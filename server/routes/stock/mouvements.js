const express = require('express');
const mouvementController = require('../../controllers/stock/mouvementController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();
router.use(checkPermission('stock:read'));

router.get('/produit/:produitId', mouvementController.getHistoriqueProduit);
router.get('/rapport', mouvementController.getRapportMouvements);

module.exports = router;