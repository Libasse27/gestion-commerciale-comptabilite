// server/services/stock/stockService.js
const mongoose = require('mongoose');
const Stock = require('../../models/stock/Stock');
const MouvementStock = require('../../models/stock/MouvementStock');
const AlerteStock = require('../../models/stock/AlerteStock');
const Produit = require('../../models/commercial/Produit');
const Role = require('../../models/auth/Role');
const User = require('../../models/auth/User');
const AppError = require('../../utils/appError');
const { STOCK_MOVEMENT_TYPES, USER_ROLES } = require('../../utils/constants');
const notificationService = require('../notifications/notificationService'); // Corrigé le chemin
const { logger } = require('../../middleware/logger');

async function _checkAndManageAlerts(stock, session) {
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
    
    if (newAlert && newAlert.createdAt.getTime() === newAlert.updatedAt.getTime()) {
      logger.info(`ALERTE STOCK: Le produit ${produit.nom} est passé sous le seuil.`);
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
  } else {
    await AlerteStock.updateMany(
      { produit: stock.produit, depot: stock.depot, statut: 'Active' },
      { $set: { statut: 'Resolue', dateResolution: new Date(), resoluPar: null } },
      { session }
    );
  }
}

async function _executeMovement(data, userId, isEntry, options = {}) {
  const { produitId, depotId, quantite, type, referenceDocument, documentId, documentModel } = data;
  if (quantite <= 0) throw new AppError('La quantité d\'un mouvement doit être positive.', 400);

  const session = options.session || await mongoose.startSession();
  if (!options.session) session.startTransaction();

  try {
    const stockUpdate = await Stock.findOneAndUpdate(
      { produit: produitId, depot: depotId },
      { $inc: { quantite: isEntry ? quantite : -quantite } },
      { new: true, upsert: true, session }
    );

    const stockAvant = stockUpdate.quantite + (isEntry ? -quantite : quantite);

    if (!isEntry && stockUpdate.quantite < 0) {
      throw new AppError(`Stock insuffisant pour le produit. Stock final serait de ${stockUpdate.quantite}.`, 409);
    }

    const [mouvement] = await MouvementStock.create([{
      produit: produitId, depot: depotId, type, quantite,
      stockAvant, stockApres: stockUpdate.quantite,
      creePar: userId, referenceDocument, documentId, documentModel
    }], { session });

    await _checkAndManageAlerts(stockUpdate, session);
    
    if (!options.session) await session.commitTransaction();
    return mouvement;
  } catch (error) {
    if (!options.session) await session.abortTransaction();
    throw error;
  } finally {
    if (!options.session) session.endSession();
  }
}

async function entreeStock(data, userId, options) {
  return _executeMovement(data, userId, true, options);
}

async function sortieStock(data, userId, options) {
  return _executeMovement(data, userId, false, options);
}

module.exports = { entreeStock, sortieStock };