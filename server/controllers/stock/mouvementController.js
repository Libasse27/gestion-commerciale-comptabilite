// ==============================================================================
//           Contrôleur pour la Consultation des Mouvements de Stock
//
// Ce contrôleur gère les requêtes HTTP pour la lecture de l'historique des
// mouvements de stock. Il ne modifie aucune donnée.
//
// Il délègue toute la logique de récupération et de filtrage des données
// au `mouvementService`.
// ==============================================================================

const mouvementService = require('../../services/stock/mouvementService');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Récupérer l'historique paginé des mouvements d'un produit
 * @route   GET /api/v1/stock/mouvements/produit/:produitId
 * @access  Privé (permission: 'read:stock')
 */
exports.getHistoriqueProduit = asyncHandler(async (req, res, next) => {
  const { produitId } = req.params;
  
  // Récupérer les options de pagination et de filtrage depuis les query parameters
  const options = {
    page: parseInt(req.query.page) || 1,
    limit: parseInt(req.query.limit) || 25,
    depotId: req.query.depotId, // Optionnel, pour filtrer par dépôt
  };
  
  const resultat = await mouvementService.getHistoriqueProduit(produitId, options);

  res.status(200).json({
    status: 'success',
    data: resultat,
  });
});

/**
 * @desc    Récupérer un rapport agrégé des mouvements sur une période
 * @route   GET /api/v1/stock/mouvements/rapport
 * @access  Privé (permission: 'read:stock' ou 'read:rapport')
 */
exports.getRapportMouvements = asyncHandler(async (req, res, next) => {
    // Récupérer les dates depuis les query parameters (ex: ?dateDebut=2024-01-01&dateFin=2024-01-31)
    const { dateDebut, dateFin } = req.query;

    if (!dateDebut || !dateFin) {
        // Pour un rapport, les dates sont généralement requises
        // return next(new AppError('Veuillez fournir une date de début et une date de fin.', 400));
    }
    
    // Utiliser les dates fournies ou des valeurs par défaut (ex: le mois en cours)
    const startDate = dateDebut ? new Date(dateDebut) : new Date(new Date().setDate(1));
    const endDate = dateFin ? new Date(dateFin) : new Date();

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