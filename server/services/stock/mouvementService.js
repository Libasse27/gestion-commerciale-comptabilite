// server/services/stock/mouvementService.js
// ==============================================================================
//           Service de Lecture et d'Analyse des Mouvements de Stock
// ==============================================================================

const MouvementStock = require('../../models/stock/MouvementStock');

/**
 * Récupère l'historique paginé des mouvements de stock pour un produit.
 */
async function getHistoriqueProduit(produitId, options = {}) {
  const page = parseInt(options.page, 10) || 1;
  const limit = parseInt(options.limit, 10) || 25;
  const { depotId } = options;

  const query = { produit: produitId };
  if (depotId) {
    query.depot = depotId;
  }

  const mouvementsPromise = MouvementStock.find(query)
    .populate('depot', 'nom')
    .populate('creePar', 'firstName lastName')
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .lean();

  const totalPromise = MouvementStock.countDocuments(query);
  const [mouvements, total] = await Promise.all([mouvementsPromise, totalPromise]);

  return {
    mouvements,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

/**
 * Génère un rapport agrégé sur les mouvements de stock sur une période.
 */
async function getRapportMouvements(dateDebut, dateFin) {
    const rapport = await MouvementStock.aggregate([
        { 
            $match: { 
                createdAt: { $gte: new Date(dateDebut), $lte: new Date(dateFin) } 
            } 
        },
        {
            $group: {
                _id: '$type',
                nombreTransactions: { $sum: 1 },
                totalQuantite: { $sum: '$quantite' }
            }
        },
        {
            $project: {
                _id: 0,
                typeMouvement: '$_id',
                nombreTransactions: 1,
                totalQuantite: 1,
            }
        },
        { $sort: { typeMouvement: 1 } }
    ]);

    return rapport;
}

module.exports = {
  getHistoriqueProduit,
  getRapportMouvements,
};