// server/controllers/dashboard/dashboardController.js
const statistiquesService = require('../../services/statistiques/statistiquesService');
const tresorerieService = require('../../services/paiements/tresorerieService');
const Facture = require('../../models/commercial/Facture');
const AlerteStock = require('../../models/stock/AlerteStock'); // Importer le modèle
const asyncHandler = require('../../utils/asyncHandler');
const { startOfDay, endOfDay, subDays } = require('date-fns');
const { DOCUMENT_STATUS } = require('../../utils/constants');

exports.getMainDashboardData = asyncHandler(async (req, res, next) => {
  const dateFin = endOfDay(new Date());
  const dateDebut = startOfDay(subDays(dateFin, 29));

  const [
    kpisCommerciaux,
    previsionnelTresorerie,
    dernieresFacturesEnRetard,
    salesChartData,
    alertesDeStock, // Ajouter ici
  ] = await Promise.all([
    statistiquesService.getKpisCommerciaux({ dateDebut, dateFin }),
    tresorerieService.getPrevisionnelTresorerie(30),
    Facture.find({ statut: DOCUMENT_STATUS.EN_RETARD })
      .sort({ dateEcheance: 1 })
      .limit(5)
      .populate('client', 'nom')
      .lean(),
    statistiquesService.getVentesAnnuelles(),
    // === AJOUTER CETTE REQUÊTE ===
    AlerteStock.find({ statut: 'Active' })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('produit', 'nom reference')
        .populate('depot', 'nom')
        .lean(),
    // ============================
  ]);

  res.status(200).json({
    status: 'success',
    data: {
      kpis: kpisCommerciaux,
      previsionnel: previsionnelTresorerie,
      facturesEnRetard: dernieresFacturesEnRetard,
      ventesAnnuelles: salesChartData,
      alertesDeStock: alertesDeStock, // Ajouter au payload
    },
  });
});