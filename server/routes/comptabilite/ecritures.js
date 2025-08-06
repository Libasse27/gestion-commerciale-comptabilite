const express = require('express');
const ecritureController = require('../../controllers/comptabilite/ecritureController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();

router.route('/')
    .post(checkPermission('comptabilite:manage'), ecritureController.createEcriture)
    .get(checkPermission('comptabilite:read'), ecritureController.getAllEcritures);

router.route('/:id')
    .get(checkPermission('comptabilite:read'), ecritureController.getEcritureById)
    .patch(checkPermission('comptabilite:manage'), ecritureController.updateEcriture)
    .delete(checkPermission('comptabilite:manage'), ecritureController.deleteEcriture);

router.post('/:id/valider', checkPermission('comptabilite:manage'), ecritureController.validerEcriture);

module.exports = router;