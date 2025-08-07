// server/routes/comptabilite/compteDeResultat.js
// ==============================================================================
//           Routeur pour le Compte de Résultat
//
// Définit la route pour la génération du compte de résultat.
// ==============================================================================

const express = require('express');
const compteDeResultatController = require('../../controllers/comptabilite/compteDeResultatController');
const { checkPermission } = require('../../middleware/permissions');

const router = express.Router();

// L'authentification est déjà gérée par le routeur parent (`comptabilite.js`)

router.get(
    '/',
    checkPermission('comptabilite:read'),
    compteDeResultatController.genererCompteDeResultat
);

module.exports = router;