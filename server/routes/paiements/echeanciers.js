const express = require('express');
const echeancierController = require('../../controllers/paiements/echeancierController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();

router.route('/')
    .post(checkPermission('paiement:manage'), echeancierController.createEcheancier)
    .get(checkPermission('comptabilite:read'), echeancierController.getAllEcheanciers);

router.get('/facture/:factureId', checkPermission('comptabilite:read'), echeancierController.getEcheancierByFacture);

router.route('/:id')
    .patch(checkPermission('paiement:manage'), echeancierController.updateEcheancier)
    .delete(checkPermission('paiement:manage'), echeancierController.deleteEcheancier);

module.exports = router;