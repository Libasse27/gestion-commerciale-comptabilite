// server/controllers/dashboard/dashboardController.js
const statistiquesService = require('../../services/statistiques/statistiquesService');
const tresorerieService = require('../../services/paiements/tresorerieService');
const Facture = require('../../models/commercial/Facture');
const asyncHandler = require('../../utils/asyncHandler');
const { startOfDay, endOfDay, subDays } = require('date-fns');
const { DOCUMENT_STATUS } = require('../../utils/constants');

/**
 * @desc    Récupérer toutes les données agrégées pour le tableau de bord principal.
 * @route   GET /api/v1/dashboard
 */
exports.getMainDashboardData = asyncHandler(async (req, res, next) => {
  // Période par défaut pour les KPIs : 30 derniers jours
  const dateFin = endOfDay(new Date());
  const dateDebut = startOfDay(subDays(dateFin, 29));

  // Lancement des promesses en parallèle
  const [
    kpisCommerciaux,
    previsionnelTresorerie,
    dernieresFacturesEnRetard,
    salesChartData,
  ] = await Promise.all([
    statistiquesService.getKpisCommerciaux({ dateDebut, dateFin }),
    tresorerieService.getPrevisionnelTresorerie(30),
    Facture.find({ statut: DOCUMENT_STATUS.EN_RETARD })
      .sort({ dateEcheance: 1 })
      .limit(5)
      .populate('client', 'nom')
      .lean(),
    statistiquesService.getVentesAnnuelles(),
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      kpis: kpisCommerciaux,
      previsionnel: previsionnelTresorerie,
      facturesEnRetard: dernieresFacturesEnRetard,
      ventesAnnuelles: salesChartData,
    },
  });
});