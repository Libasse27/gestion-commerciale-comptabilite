// ==============================================================================
//           Contrôleur pour la Consultation de l'État du Stock
//
// Ce contrôleur gère les requêtes HTTP pour la lecture de l'état actuel du
// stock. Il ne modifie pas les données mais interroge les modèles et services
// pour renvoyer des informations sur les niveaux de stock.
// ==============================================================================

const Stock = require('../../models/stock/Stock');
const stockService = require('../../services/stock/stockService');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Récupérer l'état global du stock pour tous les produits et dépôts
 * @route   GET /api/v1/stock/etats
 * @access  Privé (permission: 'read:stock')
 */
exports.getEtatStockGlobal = asyncHandler(async (req, res, next) => {
  // TODO: Implémenter la pagination
  const etatsStock = await Stock.find({})
    .populate('produit', 'nom reference type')
    .populate('depot', 'nom');

  res.status(200).json({
    status: 'success',
    results: etatsStock.length,
    data: {
      etatsStock,
    },
  });
});


/**
 * @desc    Récupérer les niveaux de stock pour un produit spécifique dans tous les dépôts
 * @route   GET /api/v1/stock/etats/produit/:produitId
 * @access  Privé (permission: 'read:stock')
 */
exports.getStockParProduit = asyncHandler(async (req, res, next) => {
  const { produitId } = req.params;
  
  const etatsStock = await Stock.find({ produit: produitId })
    .populate('depot', 'nom');
    
  if (!etatsStock || etatsStock.length === 0) {
      // Ce n'est pas une erreur, le produit peut juste ne pas avoir de stock
  }
  
  res.status(200).json({
      status: 'success',
      results: etatsStock.length,
      data: {
          etatsStock,
      }
  });
});


/**
 * @desc    Récupérer le niveau de stock pour une combinaison produit/dépôt
 * @route   GET /api/v1/stock/etats/level?produitId=...&depotId=...
 * @access  Privé (permission: 'read:stock')
 */
exports.getStockLevel = asyncHandler(async (req, res, next) => {
    const { produitId, depotId } = req.query;

    if (!produitId || !depotId) {
        return next(new AppError('Veuillez fournir un produitId et un depotId.', 400));
    }

    const quantite = await stockService.getStockLevel(produitId, depotId);

    res.status(200).json({
        status: 'success',
        data: {
            produit: produitId,
            depot: depotId,
            quantite,
        }
    });
});