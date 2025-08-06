
// server/controllers/statistiques/statistiquesController.js
const statistiquesService = require('../../services/statistiques/statistiquesService');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const { endOfDay, subDays } = require('date-fns');

exports.getKpisCommerciaux = asyncHandler(async (req, res, next) => {
    // Par défaut, la période est les 30 derniers jours
    const dateFin = endOfDay(new Date());
    const dateDebut = subDays(dateFin, 29);
    
    const kpis = await statistiquesService.getKpisCommerciaux({ dateDebut, dateFin });
    res.status(200).json({ status: 'success', data: { kpis } });
});

exports.getVentesAnnuellesChart = asyncHandler(async (req, res, next) => {
  const chartData = await statistiquesService.getVentesAnnuelles();
  res.status(200).json({ status: 'success', data: { chartData } });
});

exports.getKpisClient = asyncHandler(async (req, res, next) => {
  const { clientId } = req.params;
  if (!clientId) return next(new AppError('Veuillez fournir un ID de client.', 400));
  
  const kpis = await statistiquesService.getKpisForClient(clientId);
  res.status(200).json({ status: 'success', data: { kpis } });
});