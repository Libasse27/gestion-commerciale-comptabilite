// ==============================================================================
//           Contrôleur pour les Données des Tableaux de Bord
//
// MISE À JOUR : Appelle maintenant les services directement au lieu d'autres
// contrôleurs, ce qui est une meilleure pratique d'architecture.
// ==============================================================================

// --- Import des Services ---
const statistiquesService = require('../../services/statistiquesService');
const tresorerieService = require('../../services/paiements/tresorerieService');

// --- Import des Modèles (pour les requêtes simples) ---
const Facture = require('../../models/commercial/Facture');
const asyncHandler = require('../../utils/asyncHandler');
const { getStartOfDay, getEndOfDay } = require('../../utils/dateUtils');

/**
 * @desc    Récupérer toutes les données pour le tableau de bord principal
 * @route   GET /api/v1/dashboard/main
 * @access  Privé
 */
exports.getMainDashboardData = asyncHandler(async (req, res, next) => {
  // --- Utiliser Promise.all pour lancer toutes les requêtes en parallèle ---
  const todayStart = getStartOfDay(new Date());
  const todayEnd = getEndOfDay(new Date());

  // 1. KPIs Commerciaux (via le service)
  const kpisPromise = statistiquesService.getKpisCommerciaux(todayStart, todayEnd);

  // 2. Prévisionnel de trésorerie à 30 jours (via le service)
  const previsionnelPromise = tresorerieService.getPrevisionnelTresorerie(30);

  // 3. 5 dernières factures en retard (requête simple, peut rester ici)
  const facturesEnRetardPromise = Facture.find({ statut: 'en_retard' })
    .sort({ dateEcheance: 1 })
    .limit(5)
    .populate('client', 'nom');
    
  // 4. Données du graphique des ventes annuelles (via le service)
  const ventesAnnuellesPromise = statistiquesService.getVentesAnnuelles();

  // --- Attendre que toutes les promesses soient résolues ---
  const [
    kpis,
    previsionnel,
    dernieresFacturesEnRetard,
    ventesAnnuelles,
  ] = await Promise.all([
    kpisPromise,
    previsionnelPromise,
    facturesEnRetardPromise,
    ventesAnnuellesPromise,
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      kpis,
      previsionnelTresorerie: previsionnel,
      dernieresFacturesEnRetard,
      ventesAnnuelles,
    },
  });
});