// server/controllers/stock/mouvementController.js
const mouvementService = require('../../services/stock/mouvementService');
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const { startOfMonth, endOfMonth } = require('date-fns');

/**
 * @desc    Récupérer l'historique paginé des mouvements d'un produit
 * @route   GET /api/v1/stock/mouvements/produit/:produitId
 */
exports.getHistoriqueProduit = asyncHandler(async (req, res, next) => {
  const { produitId } = req.params;
  const options = {
    page: req.query.page,
    limit: req.query.limit,
    depotId: req.query.depotId,
  };
  
  const resultat = await mouvementService.getHistoriqueProduit(produitId, options);

  res.status(200).json({
    status: 'success',
    ...resultat, // Fusionner les métadonnées de pagination directement
  });
});

/**
 * @desc    Récupérer un rapport agrégé des mouvements sur une période
 * @route   GET /api/v1/stock/mouvements/rapport
 */
exports.getRapportMouvements = asyncHandler(async (req, res, next) => {
    const { dateDebut, dateFin } = req.query;

    // Si pas de dates, prendre le mois en cours par défaut
    const startDate = dateDebut ? new Date(dateDebut) : startOfMonth(new Date());
    const endDate = dateFin ? new Date(dateFin) : endOfMonth(new Date());

    if (startDate > endDate) {
        return next(new AppError('La date de début ne peut être postérieure à la date de fin.', 400));
    }

    const rapport = await mouvementService.getRapportMouvements(startDate, endDate);

    res.status(200).json({
        status: 'success',
        data: {
            periode: {
                debut: startDate.toISOString().split('T')[0],
                fin: endDate.toISOString().split('T')[0],
            },
            rapport,
        }
    });
});