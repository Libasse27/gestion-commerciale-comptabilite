const express = require('express');
const inventaireController = require('../../controllers/stock/inventaireController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();

router.route('/')
    .post(checkPermission('stock:manage'), inventaireController.startInventaire)
    .get(checkPermission('stock:read'), inventaireController.getAllInventaires);

router.route('/:id')
    .get(checkPermission('stock:read'), inventaireController.getInventaireById);

router.post('/:id/lignes', checkPermission('stock:manage'), inventaireController.addOrUpdateLine);
router.post('/:id/valider', checkPermission('stock:manage'), inventaireController.validateInventaire);

module.exports = router;