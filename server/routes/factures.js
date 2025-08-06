// server/routes/factures.js
const express = require('express');
const factureController = require('../controllers/commercial/factureController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
router.use(protect);

router.route('/')
  .get(checkPermission('vente:read'), factureController.getAllFactures);

router.post(
  '/from-commande',
  checkPermission('vente:create'),
  factureController.createFactureFromCommande
);

router.route('/:id')
  .get(checkPermission('vente:read'), factureController.getFactureById);

router.get(
  '/:id/pdf',
  checkPermission('vente:read'),
  factureController.downloadFacturePdf
);

router.post(
  '/:id/paiements',
  checkPermission('paiement:manage'),
  factureController.addPaiementToFacture
);

router.post(
  '/:id/valider',
  checkPermission('vente:validate'),
  factureController.validerFacture
);

module.exports = router;