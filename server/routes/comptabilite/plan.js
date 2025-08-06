const express = require('express');
const comptaController = require('../../controllers/comptabilite/comptabiliteController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();

router.route('/')
    .get(checkPermission('comptabilite:read'), comptaController.getPlanComptable)
    .post(checkPermission('comptabilite:manage'), comptaController.createCompteComptable);

router.patch('/:id', checkPermission('comptabilite:manage'), comptaController.updateCompteComptable);

module.exports = router;