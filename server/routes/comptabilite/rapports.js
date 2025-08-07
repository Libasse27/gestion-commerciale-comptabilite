// server/routes/comptabilite/rapports.js
const express = require('express');
const rapportController = require('../../controllers/dashboard/rapportController'); // Le nom vient d'ici
const { checkPermission } = require('../../middleware/permissions');
const compteDeResultatRoutes = require('./compteDeResultat');

const router = express.Router();
// La permission de base est déjà gérée par le routeur parent `comptabilite.js`

// Routes pour les rapports gérés par le contrôleur principal des rapports
router.get('/balance-generale', rapportController.getBalanceGenerale);
router.get('/bilan', rapportController.getBilan);
router.get('/declaration-tva', rapportController.getDeclarationTVA); // Assurez-vous que cette route est là aussi

// Utiliser le sous-routeur dédié pour toutes les routes liées au compte de résultat
router.use('/compte-de-resultat', compteDeResultatRoutes);

module.exports = router;