// ==============================================================================
//           Service de Gestion des Stocks (Logique Métier)
//
// MISE À JOUR : Intégration avec le `notificationService` pour envoyer des
// alertes de stock bas en temps réel aux utilisateurs concernés.
// ==============================================================================

// --- Import des Modèles ---
const Stock = require('../../models/stock/Stock');
const MouvementStock = require('../../models/stock/MouvementStock');
const AlerteStock = require('../../models/stock/AlerteStock');
const Produit = require('../../models/commercial/Produit');
const User = require('../../models/auth/User');
const Role = require('../../models/auth/Role');

// --- Import des Utils et Services ---
const AppError = require('../../utils/appError');
const { STOCK_MOVEMENT_TYPES, USER_ROLES } = require('../../utils/constants');
const notificationService = require('../notifications/notificationService'); // Import du service de notification
const { logger } = require('../../middleware/logger');

/**
 * Fonction privée pour récupérer ou créer une ligne de stock.
 * @private
 */
const _getOrCreateStock = async (produitId, depotId) => {
  // ... (fonction inchangée)
  let stock = await Stock.findOne({ produit: produitId, depot: depotId });
  if (!stock) {
    const produit = await Produit.findById(produitId);
    if (!produit) throw new AppError('Produit non trouvé.', 404);
    stock = await Stock.create({
      produit: produitId, depot: depotId, quantite: 0, seuilAlerte: produit.seuilAlerteStock,
    });
  }
  return stock;
};

/**
 * Fonction privée pour vérifier et gérer les alertes de stock.
 * @private
 */
const _checkAndManageAlerts = async (stock) => {
  const produit = await Produit.findById(stock.produit).populate({ path: 'depot', model: 'Depot', select: 'nom' });
  const seuil = stock.seuilAlerte > 0 ? stock.seuilAlerte : produit.seuilAlerteStock;
  
  if (seuil <= 0) return;

  if (stock.quantite < seuil) {
    const alerteExistante = await AlerteStock.findOne({ produit: stock.produit, depot: stock.depot, statut: 'Active' });
    if (!alerteExistante) {
      await AlerteStock.create({
        produit: stock.produit, depot: stock.depot, seuilAlerte: seuil, quantiteRestante: stock.quantite,
      });
      
      logger.info(`ALERTE STOCK: Le produit ${produit.nom} est passé sous le seuil.`);
      
      // --- ENVOI DE LA NOTIFICATION ---
      const adminRole = await Role.findOne({ name: USER_ROLES.ADMIN });
      const admins = await User.find({ role: adminRole._id });
      
      for (const admin of admins) {
        notificationService.createNotification({
          destinataireId: admin._id,
          type: 'warning',
          message: `Stock bas pour le produit "${produit.nom}". Quantité restante : ${stock.quantite}.`,
          lien: `/stock/produits/${produit._id}`, // Lien vers la fiche produit
        });
      }
    }
  } else {
    await AlerteStock.updateMany(
      { produit: stock.produit, depot: stock.depot, statut: 'Active' },
      { statut: 'Resolue', dateResolution: new Date() }
    );
  }
};


/**
 * Enregistre une entrée de stock.
 */
async function entreeStock({ produitId, depotId, quantite, type }, userId, referenceDocument = '') {
  // ... (fonction inchangée)
  if (quantite <= 0) throw new AppError('La quantité doit être positive.', 400);
  const stock = await _getOrCreateStock(produitId, depotId);
  const stockAvant = stock.quantite;
  stock.quantite += quantite;
  await stock.save();
  await MouvementStock.create({
    produit: produitId, depot: depotId, type, quantite, stockAvant, stockApres: stock.quantite,
    creePar: userId, referenceDocument,
  });
  await _checkAndManageAlerts(stock);
  return stock;
}

/**
 * Enregistre une sortie de stock.
 */
async function sortieStock({ produitId, depotId, quantite, type }, userId, referenceDocument = '') {
  // ... (fonction inchangée)
  if (quantite <= 0) throw new AppError('La quantité doit être positive.', 400);
  const stock = await _getOrCreateStock(produitId, depotId);
  if (stock.quantite < quantite) {
    const produit = await Produit.findById(produitId).select('nom');
    throw new AppError(`Stock insuffisant pour ${produit.nom}. Stock: ${stock.quantite}, Demandé: ${quantite}.`, 400);
  }
  const stockAvant = stock.quantite;
  stock.quantite -= quantite;
  await stock.save();
  await MouvementStock.create({
    produit: produitId, depot: depotId, type, quantite, stockAvant, stockApres: stock.quantite,
    creePar: userId, referenceDocument,
  });
  await _checkAndManageAlerts(stock);
  return stock;
}

/**
 * Récupère le niveau de stock pour un produit dans un dépôt.
 */
async function getStockLevel(produitId, depotId) {
  // ... (fonction inchangée)
  const stock = await Stock.findOne({ produit: produitId, depot: depotId });
  return stock ? stock.quantite : 0;
}


module.exports = {
  entreeStock,
  sortieStock,
  getStockLevel,
};