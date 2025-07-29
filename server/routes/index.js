// ==============================================================================
//           Routeur Principal de l'API (/api/v1)
//
// Ce fichier est le point d'entrée pour toutes les routes de l'API V1.
// Il importe tous les routeurs spécifiques à chaque ressource (auth, users,
// clients, etc.) et les monte sur leurs chemins respectifs.
//
// Cette approche modulaire permet de garder le fichier `app.js` très simple
// et de bien organiser la logique de routage à mesure que l'application grandit.
// ==============================================================================

const express = require('express');

// --- Importation des Routeurs Spécifiques ---
const authRoutes = require('./auth');
const userRoutes = require('./users');
const roleRoutes = require('./roles'); // Si vous avez créé ce routeur
const clientRoutes = require('./clients');
const fournisseurRoutes = require('./fournisseurs');
const produitRoutes = require('./produits');
const devisRoutes = require('./devis');
const commandeRoutes = require('./commandes');
const factureRoutes = require('./factures');
const statistiquesRoutes = require('./statistiques');
const alerteStockRoutes = require('./alertesStock');
const mouvementStockRoutes = require('./mouvementsStock');
const inventaireRoutes = require('./inventaires');
const stockRoutes = require('./stock');
const comptabiliteRoutes = require('./comptabilite');
//const ecritureRoutes = require('./ecritures');
const rapportRoutes = require('./rapports');
const balanceRoutes = require('./balances');
const paiementRoutes = require('./paiements');
const echeancierRoutes = require('./echeanciers');
const mobileMoneyRoutes = require('./mobileMoney');
const backupRoutes = require('./backups');
const notificationRoutes = require('./notifications');
// ... importez les autres routeurs au fur et à mesure

// --- Initialisation du Routeur Principal ---
const router = express.Router();

// Route de "health check" pour l'API V1
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP' });
});


// --- Montage des Routeurs Spécifiques ---

// Les routes définies dans `authRoutes` seront accessibles via `/api/v1/auth`
router.use('/auth', authRoutes);

// Les routes définies dans `userRoutes` seront accessibles via `/api/v1/users`
router.use('/users', userRoutes);

// Les routes définies dans `roleRoutes` seront accessibles via `/api/v1/roles`
router.use('/roles', roleRoutes);

// Les routes pour les clients seront accessibles via `/api/v1/clients`
router.use('/clients', clientRoutes);

// Les routes pour les fournisseurs seront accessibles via `/api/v1/fournisseurs`
router.use('/fournisseurs', fournisseurRoutes);

// Les routes pour les produits seront accessibles via `/api/v1/produits`
router.use('/produits', produitRoutes);

// Les routes pour les devis seront accessibles via `/api/v1/devis`
router.use('/devis', devisRoutes);

// Les routes pour les commandes seront accessibles via `/api/v1/commandes`
router.use('/commandes', commandeRoutes);

// Les routes pour les factures seront accessibles via `/api/v1/factures`
router.use('/factures', factureRoutes);

// Les routes pour les statistiques seront accessibles via `/api/v1/statistiques`
router.use('/statistiques', statistiquesRoutes);

// Les routes pour les alertes de stock seront accessibles via `/api/v1/stock/alertes`
router.use('/alertes', alerteStockRoutes);

// Les routes pour les mouvements de stock seront accessibles via `/api/v1/stock/mouvements`
router.use('/mouvements', mouvementStockRoutes);

// Les routes pour les inventaires seront accessibles via `/api/v1/stock/inventaires`
router.use('/inventaires', inventaireRoutes);

// Les routes pour l'état du stock seront accessibles via `/api/v1/stock/etats`
router.use('/etats', stockRoutes);

// Les routes pour la comptabilité seront accessibles via `/api/v1/comptabilite`
router.use('/comptabilite', comptabiliteRoutes);

// Les routes pour les écritures comptables seront accessibles via `/api/v1/comptabilite/ecritures`
// router.use('/ecritures', ecritureRoutes);

// Les routes pour les rapports seront accessibles via `/api/v1/comptabilite/rapports`
router.use('/rapports', rapportRoutes);

// Les routes pour les balances comptables seront accessibles via `/api/v1/comptabilite/balances`
router.use('/balances', balanceRoutes);

// Les routes pour les paiements seront accessibles via `/api/v1/paiements`
router.use('/paiements', paiementRoutes);

// Les routes pour les échéanciers seront accessibles via `/api/v1/echeanciers`
router.use('/echeanciers', echeancierRoutes);

// Les routes pour les transactions Mobile Money seront accessibles via `/api/v1/mobile-money`
router.use('/mobile-money', mobileMoneyRoutes);

// Les routes pour les sauvegardes seront accessibles via `/api/v1/system/backups`
router.use('/system/backups', backupRoutes);

// Les routes pour les notifications seront accessibles via `/api/v1/system/notifications`
router.use('/system/notifications', notificationRoutes);

// ... montez les autres routeurs ici ...


// --- Exportation du Routeur Principal ---
module.exports = router;