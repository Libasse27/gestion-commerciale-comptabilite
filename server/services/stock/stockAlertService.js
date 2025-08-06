// server/services/stock/stockAlertService.js
const mongoose = require('mongoose');
const Stock = require('../../models/stock/Stock');
const AlerteStock = require('../../models/stock/AlerteStock');
const Produit = require('../../models/commercial/Produit');
const Role = require('../../models/auth/Role');
const User = require('../../models/auth/User');
const { USER_ROLES } = require('../../utils/constants');
const notificationService = require('../system/notificationService');
const { logger } = require('../../middleware/logger');

/**
 * Vérifie le niveau de stock pour une ligne de stock donnée et gère les alertes.
 * C'est la fonction centrale de gestion des alertes, utilisée à la fois
 * en temps réel par `stockService` et périodiquement par le cron job.
 * @param {object} stock - Le document Mongoose de la ligne de stock.
 * @param {object} [options={}] - Options, notamment la session MongoDB.
 */
async function checkAndManageAlerts(stock, options = {}) {
  const { session } = options;
  
  // Utiliser .lean() pour la performance car c'est une lecture
  const produit = await Produit.findById(stock.produit).session(session).lean();
  if (!produit || !produit.suiviStock) return;

  const seuil = stock.seuilAlerte > 0 ? stock.seuilAlerte : produit.seuilAlerteStock;
  if (seuil <= 0) return;

  if (stock.quantite <= seuil) {
    const newAlert = await AlerteStock.findOneAndUpdate(
      { produit: stock.produit, depot: stock.depot, statut: 'Active' },
      { $setOnInsert: { produit: stock.produit, depot: stock.depot, seuilAlerte: seuil, quantiteRestante: stock.quantite }},
      { upsert: true, new: true, session }
    );
    
    // Si un document a été créé (et non juste trouvé)
    if (newAlert && newAlert.createdAt.getTime() === newAlert.updatedAt.getTime()) {
      logger.info(`ALERTE STOCK: Produit "${produit.nom}" sous le seuil dans le dépôt ${stock.depot}.`);
      
      const adminRole = await Role.findOne({ name: USER_ROLES.ADMIN }).session(session).lean();
      if(adminRole) {
        const admins = await User.find({ role: adminRole._id }).session(session).lean();
        for (const admin of admins) {
          notificationService.createNotification({
            destinataire: admin._id, type: 'warning',
            message: `Stock bas pour "${produit.nom}". Quantité: ${stock.quantite}.`,
            lien: `/app/stock/produits/${produit._id}`,
          });
        }
      }
    }
  } else { // Si le stock est au-dessus du seuil, on résout les alertes actives.
    await AlerteStock.updateMany(
      { produit: stock.produit, depot: stock.depot, statut: 'Active' },
      { $set: { statut: 'Resolue', dateResolution: new Date(), resoluPar: null } },
      { session }
    );
  }
}

/**
 * Fonction principale du service, appelée par un cron job.
 * Scanne toutes les lignes de stock et vérifie leur statut d'alerte.
 */
async function runStockLevelChecks() {
    logger.info('--- Démarrage de la tâche de vérification des niveaux de stock ---');
    try {
        const stocksToCheck = await Stock.find({}).lean();
        if (stocksToCheck.length === 0) {
            logger.info('Aucun stock à vérifier.');
            return;
        }

        logger.info(`${stocksToCheck.length} ligne(s) de stock à vérifier...`);
        // On exécute les vérifications en parallèle pour la performance
        await Promise.all(stocksToCheck.map(stock => checkAndManageAlerts(stock)));

    } catch (error) {
        logger.error('Une erreur est survenue dans le service de vérification des stocks.', { error });
    } finally {
        logger.info('--- Tâche de vérification des niveaux de stock terminée ---');
    }
}

module.exports = {
  checkAndManageAlerts,
  runStockLevelChecks,
};