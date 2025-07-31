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
// Note: On importe uniquement les routeurs qui existent déjà.
// Les autres seront décommentés au fur et à mesure de leur création.
const authRoutes = require('./auth');
const userRoutes = require('./users');
// const roleRoutes = require('./roles');
// const clientRoutes = require('./clients');
// const fournisseurRoutes = require('./fournisseurs');
// const produitRoutes = require('./produits');
// ... etc.

// --- Initialisation du Routeur Principal ---
const router = express.Router();


// ==================================================
// --- Routes Système                             ---
// ==================================================

// Route de "health check" pour vérifier que l'API V1 est en ligne.
// Utile pour les services de monitoring.
router.get('/health', (req, res) => {
    res.status(200).json({ status: 'UP', timestamp: new Date().toISOString() });
});


// ==================================================
// --- Montage des Routeurs par Domaine           ---
// ==================================================

// --- Domaine : Authentification & Utilisateurs ---
router.use('/auth', authRoutes); // /api/v1/auth
router.use('/users', userRoutes); // /api/v1/users
// router.use('/roles', roleRoutes); // /api/v1/roles


// --- Domaine : Tiers (Clients & Fournisseurs) ---
// router.use('/clients', clientRoutes); // /api/v1/clients
// router.use('/fournisseurs', fournisseurRoutes); // /api/v1/fournisseurs


// --- Domaine : Commercial (Produits, Ventes, Achats) ---
// router.use('/produits', produitRoutes); // /api/v1/produits
// router.use('/ventes/devis', devisRoutes); // /api/v1/ventes/devis
// router.use('/ventes/commandes', commandeRoutes); // /api/v1/ventes/commandes
// router.use('/ventes/factures', factureRoutes); // /api/v1/ventes/factures


// --- Domaine : Stock ---
// router.use('/stock', stockRoutes); // /api/v1/stock


// --- Domaine : Comptabilité ---
// router.use('/comptabilite', comptabiliteRoutes); // /api/v1/comptabilite


// --- Domaine : Système & Paramétrage ---
// router.use('/system/audit-logs', auditLogRoutes); // /api/v1/system/audit-logs
// router.use('/system/parametres', parametresRoutes); // /api/v1/system/parametres


// --- Domaine : Rapports & Dashboards ---
// router.use('/dashboard', dashboardRoutes); // /api/v1/dashboard
// router.use('/rapports', rapportRoutes); // /api/v1/rapports


// --- Exportation du Routeur Principal ---
module.exports = router;