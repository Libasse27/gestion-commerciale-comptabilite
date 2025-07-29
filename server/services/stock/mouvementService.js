// ==============================================================================
//           Service de Lecture des Mouvements de Stock
//
// Ce service est spécialisé dans la LECTURE et l'ANALYSE de l'historique des
// mouvements de stock. Il ne modifie pas l'état du stock.
//
// Il fournit des fonctions pour :
//   - Consulter l'historique détaillé d'un produit.
//   - Générer des données pour des rapports sur la rotation des stocks.
// ==============================================================================

const MouvementStock = require('../../models/stock/MouvementStock');
const AppError = require('../../utils/appError');

/**
 * Récupère l'historique paginé des mouvements de stock pour un produit spécifique.
 * @param {string} produitId - L'ID du produit.
 * @param {object} [options={}] - Options de pagination et de filtrage.
 * @param {number} [options.page=1] - Le numéro de la page.
 * @param {number} [options.limit=25] - Le nombre de mouvements par page.
 * @param {string} [options.depotId] - Pour filtrer par un dépôt spécifique.
 * @returns {Promise<{mouvements: Array, total: number, pages: number}>}
 */
async function getHistoriqueProduit(produitId, options = {}) {
  const { page = 1, limit = 25, depotId } = options;

  const query = { produit: produitId };
  if (depotId) {
    query.depot = depotId;
  }

  const mouvements = await MouvementStock.find(query)
    .populate('depot', 'nom')
    .populate('creePar', 'firstName lastName')
    .sort({ createdAt: -1 }) // Du plus récent au plus ancien
    .skip((page - 1) * limit)
    .limit(limit)
    .lean(); // .lean() pour de meilleures performances en lecture seule

  const total = await MouvementStock.countDocuments(query);

  return {
    mouvements,
    total,
    pages: Math.ceil(total / limit),
    currentPage: page,
  };
}

/**
 * Récupère un rapport sur les mouvements de stock sur une période donnée.
 * @param {Date} dateDebut - La date de début de la période.
 * @param {Date} dateFin - La date de fin de la période.
 * @returns {Promise<object>} Un rapport agrégé.
 */
async function getRapportMouvements(dateDebut, dateFin) {
    const rapport = await MouvementStock.aggregate([
        // 1. Filtrer par période
        { $match: { createdAt: { $gte: dateDebut, $lte: dateFin } } },
        // 2. Grouper par type de mouvement pour avoir des totaux
        {
            $group: {
                _id: '$type',
                nombreTransactions: { $sum: 1 },
                totalQuantite: { $sum: '$quantite' }
            }
        },
        // 3. Renommer le champ _id pour plus de clarté
        {
            $project: {
                _id: 0,
                typeMouvement: '$_id',
                nombreTransactions: 1,
                totalQuantite: 1,
            }
        }
    ]);

    return rapport;
}


module.exports = {
  getHistoriqueProduit,
  getRapportMouvements,
};