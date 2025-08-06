// server/routes/devis.js
const express = require('express');
const devisController = require('../controllers/commercial/devisController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
router.use(protect);

router.route('/')
  .post(checkPermission('vente:create'), devisController.createDevis)
  .get(checkPermission('vente:read'), devisController.getAllDevis);

router.route('/:id')
  .get(checkPermission('vente:read'), devisController.getDevisById)
  .patch(checkPermission('vente:update'), devisController.updateDevis)
  .delete(checkPermission('vente:delete'), devisController.deleteDevis);

router.post(
  '/:id/convertir-commande',
  checkPermission('vente:create'),
  devisController.convertToCommande
);

module.exports = router;