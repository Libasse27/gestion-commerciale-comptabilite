// server/routes/statistiques.js
const express = require('express');
const statistiquesController = require('../controllers/statistiques/statistiquesController');
const { protect } = require('../middleware/auth');
// TODO: Ajouter des permissions spécifiques pour les rapports
// const { checkPermission } = require('../middleware/permissions');

const router = express.Router();
router.use(protect);

// Route principale pour les KPIs du tableau de bord
router.get('/kpis-commerciaux', statistiquesController.getKpisCommerciaux);

// Route pour le graphique des ventes
router.get('/ventes-annuelles', statistiquesController.getVentesAnnuellesChart);

// Route pour les KPIs d'un client spécifique
router.get('/clients/:clientId', statistiquesController.getKpisClient);


module.exports = router;