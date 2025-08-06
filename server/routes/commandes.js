// server/routes/commandes.js
const express = require('express');
const commandeController = require('../controllers/commercial/commandeController');
const { protect } = require('../middleware/auth');
const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
router.use(protect);

router.route('/')
  .get(checkPermission('vente:read'), commandeController.getAllCommandes);

router.route('/:id')
  .get(checkPermission('vente:read'), commandeController.getCommandeById)
  .patch(checkPermission('vente:update'), commandeController.updateCommande);

router.post(
  '/:id/creer-bon-livraison', // ID de la commande
  checkPermission('vente:create'),
  commandeController.createBonLivraisonFromCommande
);

module.exports = router;