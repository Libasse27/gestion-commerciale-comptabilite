// server/routes/fournisseurs.js
const express = require('express');
const fournisseurController = require('../controllers/commercial/fournisseurController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middleware/validation');

const router = express.Router();
router.use(protect);

router.route('/')
  .post(
    checkPermission('fournisseur:create'),
    [
        body('nom', 'Le nom du fournisseur est obligatoire.').not().isEmpty().trim(),
        body('email', 'Veuillez fournir un email valide.').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
    ],
    handleValidationErrors,
    fournisseurController.createFournisseur
  )
  .get(
    checkPermission('fournisseur:read'),
    fournisseurController.getAllFournisseurs
  );

router.route('/:id')
  .get(
    checkPermission('fournisseur:read'),
    fournisseurController.getFournisseurById
  )
  .patch(
    checkPermission('fournisseur:update'),
    fournisseurController.updateFournisseur
  )
  .delete(
    checkPermission('fournisseur:delete'),
    fournisseurController.deleteFournisseur
  );

module.exports = router;