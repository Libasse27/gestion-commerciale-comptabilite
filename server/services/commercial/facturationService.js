// server/services/commercial/facturationService.js
const mongoose = require('mongoose');
const Facture = require('../../models/commercial/Facture');
const Commande = require('../../models/commercial/Commande');
const Client = require('../../models/commercial/Client');
const AppError = require('../../utils/appError');
const dateUtils = require('../../utils/dateUtils');
const stockService = require('../stock/stockService');
const ecritureService = require('../comptabilite/ecritureService');
const emailService = require('../notifications/emailService');
const { logger } = require('../../middleware/logger');
const { DOCUMENT_STATUS } = require('../../utils/constants');

async function createFactureFromCommande(commandeId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const commande = await Commande.findById(commandeId).session(session);
    if (!commande) throw new AppError('Commande non trouvée.', 404);
    
    if (await Facture.findOne({ commandeOrigine: commandeId }).session(session)) {
      throw new AppError('Cette commande a déjà été facturée.', 409);
    }

    const client = await Client.findById(commande.client).session(session);
    if (!client) throw new AppError('Client associé non trouvé.', 404);
    
    const [nouvelleFacture] = await Facture.create([{
      client: commande.client,
      dateEcheance: dateUtils.addDaysToDate(new Date(), client.termesPaiement || 30),
      lignes: commande.lignes,
      totalHT: commande.totalHT, totalTVA: commande.totalTVA, totalTTC: commande.totalTTC,
      commandeOrigine: commande._id, creePar: userId,
    }], { session });
    
    commande.facturesAssociees.push(nouvelleFacture._id);
    await commande.save({ session });
    
    await session.commitTransaction();
    logger.info(`Facture ${nouvelleFacture.numero} créée depuis la commande ${commande.numero}.`);
    return nouvelleFacture;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

async function validerFacture(factureId, userId) {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const facture = await Facture.findById(factureId).session(session).populate('client');
    if (!facture) throw new AppError('Facture non trouvée', 404);
    if (facture.comptabilise) throw new AppError('Cette facture a déjà été validée.', 400);

    for (const ligne of facture.lignes) {
      // TODO: Rendre le dépôt dynamique
      // await stockService.sortieStock({ ... }, userId, { session });
    }

    // await ecritureService.genererEcritureVente(facture, userId, { session });
    
    facture.comptabilise = true;
    facture.statut = DOCUMENT_STATUS.ENVOYE;
    await facture.save({ session });

    // if (facture.client.email) {
    //     await emailService.sendNouvelleFacture(facture, facture.client);
    // }
    
    await session.commitTransaction();
    logger.info(`Facture ${facture.numero} validée.`);
    return facture;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}

module.exports = {
  createFactureFromCommande,
  validerFacture,
};