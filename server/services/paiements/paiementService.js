const mongoose = require('mongoose');
const Paiement = require('../../models/paiements/Paiement');
const Facture = require('../../models/commercial/Facture');
const FactureAchat = require('../../models/commercial/FactureAchat');
const Client = require('../../models/commercial/Client');
const Fournisseur = require('../../models/commercial/Fournisseur');
//const ecritureService = require('../comptabilite/ecritureService');
const AppError = require('../../utils/appError');
const { roundTo } = require('../../utils/numberUtils');
const { logger } = require('../../middleware/logger');

async function enregistrerEncaissementClient(paiementData, userId) {
  const { clientId, montant, datePaiement, modePaiementId, compteTresorerieId, imputations, reference, notes } = paiementData;
  
  const totalImpute = roundTo(imputations.reduce((sum, imp) => sum + imp.montantImpute, 0));
  if (Math.abs(totalImpute - roundTo(montant)) > 0.01) {
    throw new AppError('La somme des montants imputés ne correspond pas au montant total du paiement.', 400);
  }
  
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [nouveauPaiement] = await Paiement.create([{
      datePaiement, montant, sens: 'Entrant',
      tiers: clientId, tiersModel: 'Client',
      modePaiement: modePaiementId, compteTresorerie: compteTresorerieId,
      imputations: imputations.map(imp => ({ ...imp, factureModel: 'Facture' })),
      enregistrePar: userId, reference, notes
    }], { session });

    for (const imp of imputations) {
      await Facture.findByIdAndUpdate(imp.factureId, { $inc: { montantPaye: roundTo(imp.montantImpute) } }, { session, runValidators: true });
    }
    
    await Client.findByIdAndUpdate(clientId, { $inc: { solde: -roundTo(montant) } }, { session });
    
    // await ecritureService.genererEcriturePaiement(nouveauPaiement, { session });
    
    await session.commitTransaction();
    logger.info(`Encaissement ${nouveauPaiement.reference} de ${montant} enregistré pour le client ${clientId}.`);
    return nouveauPaiement;
  } catch (error) {
    await session.abortTransaction();
    throw new AppError(`L'opération a échoué : ${error.message}`, 500);
  } finally {
    session.endSession();
  }
}

async function enregistrerDecaissementFournisseur(paiementData, userId) {
    const { fournisseurId, montant, datePaiement, modePaiementId, compteTresorerieId, imputations, reference, notes } = paiementData;

    const totalImpute = roundTo(imputations.reduce((sum, imp) => sum + imp.montantImpute, 0));
    if (Math.abs(totalImpute - roundTo(montant)) > 0.01) {
      throw new AppError('La somme des montants imputés ne correspond pas au montant total du paiement.', 400);
    }

    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const [nouveauPaiement] = await Paiement.create([{
            datePaiement, montant, sens: 'Sortant',
            tiers: fournisseurId, tiersModel: 'Fournisseur',
            modePaiement: modePaiementId, compteTresorerie: compteTresorerieId,
            imputations: imputations.map(imp => ({ ...imp, factureModel: 'FactureAchat' })),
            enregistrePar: userId, reference, notes
        }], { session });

        for (const imp of imputations) {
            await FactureAchat.findByIdAndUpdate(imp.factureId, { $inc: { montantPaye: roundTo(imp.montantImpute) } }, { session, runValidators: true });
        }

        await Fournisseur.findByIdAndUpdate(fournisseurId, { $inc: { solde: -roundTo(montant) } }, { session });

        // await ecritureService.genererEcriturePaiement(nouveauPaiement, { session });

        await session.commitTransaction();
        logger.info(`Décaissement ${nouveauPaiement.reference} de ${montant} enregistré pour le fournisseur ${fournisseurId}.`);
        return nouveauPaiement;
    } catch (error) {
        await session.abortTransaction();
        throw new AppError(`L'opération a échoué : ${error.message}`, 500);
    } finally {
        session.endSession();
    }
}

module.exports = {
  enregistrerEncaissementClient,
  enregistrerDecaissementFournisseur,
};