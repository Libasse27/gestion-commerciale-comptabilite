const mongoose = require('mongoose');
const Inventaire = require('../../models/stock/Inventaire');
const Stock = require('../../models/stock/Stock');
const Depot = require('../../models/stock/Depot');
const stockService = require('./stockService');
const { STOCK_MOVEMENT_TYPES } = require('../../utils/constants');
const AppError = require('../../utils/appError');
const { logger } = require('../../middleware/logger');

async function startInventaire(depotId, userId) {
  const depot = await Depot.findById(depotId).lean();
  if (!depot) throw new AppError('Dépôt non trouvé.', 404);
  
  if (await Inventaire.findOne({ depot: depotId, statut: 'En cours' })) {
      throw new AppError(`Un inventaire est déjà en cours pour ce dépôt.`, 409);
  }

  const stockLines = await Stock.find({ depot: depotId }).lean();
  const lignesInitiales = stockLines.map(stock => ({
      produit: stock.produit,
      quantiteTheorique: stock.quantite,
      quantitePhysique: stock.quantite, // Pré-remplir avec la qté théorique
  }));

  const nouvelInventaire = await Inventaire.create({
    depot: depotId,
    realisePar: userId,
    lignes: lignesInitiales,
  });
  
  return nouvelInventaire;
}

async function updateInventaireLine(inventaireId, produitId, quantitePhysique) {
  if (quantitePhysique < 0) throw new AppError('La quantité physique ne peut être négative.', 400);
  
  const inventaire = await Inventaire.findById(inventaireId);
  if (!inventaire) throw new AppError('Inventaire non trouvé.', 404);
  if (inventaire.statut !== 'En cours') throw new AppError('Seul un inventaire "En cours" peut être modifié.', 403);

  const lineToUpdate = inventaire.lignes.find(line => line.produit.equals(produitId));
  if (!lineToUpdate) throw new AppError('Produit non trouvé dans cet inventaire.', 404);

  lineToUpdate.quantitePhysique = quantitePhysique;
  
  await inventaire.save();
  return inventaire;
}

async function validateInventaire(inventaireId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const inventaire = await Inventaire.findById(inventaireId).session(session).populate('lignes.produit', 'nom');
    if (!inventaire) throw new AppError('Inventaire non trouvé.', 404);
    if (inventaire.statut !== 'En cours') throw new AppError('Seul un inventaire "En cours" peut être validé.', 403);

    logger.info(`Validation de l'inventaire N°${inventaire.numero}...`);
    for (const ligne of inventaire.lignes) {
      if (ligne.ecart !== 0) {
        const commonData = {
          produitId: ligne.produit._id, depotId: inventaire.depot, 
          referenceDocument: `Inventaire ${inventaire.numero}`, documentId: inventaire._id, documentModel: 'Inventaire'
        };
        if (ligne.ecart > 0) {
          await stockService.entreeStock({ ...commonData, quantite: ligne.ecart, type: STOCK_MOVEMENT_TYPES.AJUSTEMENT_POSITIF }, userId, { session });
        } else {
          await stockService.sortieStock({ ...commonData, quantite: Math.abs(ligne.ecart), type: STOCK_MOVEMENT_TYPES.AJUSTEMENT_NEGATIF }, userId, { session });
        }
      }
    }

    inventaire.statut = 'Validé';
    inventaire.validePar = userId;
    inventaire.dateValidation = new Date();
    await inventaire.save({ session });
    
    await session.commitTransaction();
    logger.info(`Inventaire N°${inventaire.numero} validé avec succès.`);
    return inventaire;
  } catch (error) {
    await session.abortTransaction();
    logger.error(`Échec de la validation de l'inventaire ${inventaireId}.`, { error: error.message });
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = { startInventaire, updateInventaireLine, validateInventaire };