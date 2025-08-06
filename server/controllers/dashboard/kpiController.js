// server/controllers/dashboard/kpiController.js
const statistiquesService = require('../../services/statistiques/statistiquesService');
const tresorerieService = require('../../services/paiements/tresorerieService');
const asyncHandler = require('../../utils/asyncHandler');
const { startOfDay, endOfDay, subDays } = require('date-fns'); // Utiliser date-fns

/**
 * @desc    Récupérer les KPIs commerciaux principaux.
 */
exports.getKpisCommerciaux = asyncHandler(async (req, res, next) => {
  // Par défaut : 30 derniers jours
  const dateFin = req.query.dateFin ? endOfDay(new Date(req.query.dateFin)) : endOfDay(new Date());
  const dateDebut = req.query.dateDebut ? startOfDay(new Date(req.query.dateDebut)) : subDays(dateFin, 29);

  const kpis = await statistiquesService.getKpisCommerciaux({ dateDebut, dateFin });
  res.status(200).json({ status: 'success', data: kpis });
});


/**
 * @desc    Récupérer les KPIs de trésorerie.
 */
exports.getKpisTresorerie = asyncHandler(async (req, res, next) => {
  const [soldeActuel, previsionnel] = await Promise.all([
      tresorerieService.getSoldeTresorerieActuel(),
      tresorerieService.getPrevisionnelTresorerie(30),
  ]);

  const kpis = {
    soldeTresorerieActuel: soldeActuel,
    previsionnel30j: previsionnel,
  };
    
  res.status(200).json({ status: 'success', data: kpis });
});