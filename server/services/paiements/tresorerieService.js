// server/services/paiements/tresorerieService.js
const Paiement = require('../../models/paiements/Paiement');
const Facture = require('../../models/commercial/Facture');
const FactureAchat = require('../../models/commercial/FactureAchat');
const { roundTo } = require('../../utils/numberUtils');
const { DOCUMENT_STATUS } = require('../../utils/constants');

async function getSoldeTresorerieActuel() {
  const result = await Paiement.aggregate([
    { $group: { _id: '$sens', total: { $sum: '$montant' } } }
  ]);

  const totalEntrant = result.find(r => r._id === 'Entrant')?.total || 0;
  const totalSortant = result.find(r => r._id === 'Sortant')?.total || 0;

  return roundTo(totalEntrant - totalSortant);
}

async function getTableauFluxTresorerie(dateDebut, dateFin) {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  const matchStage = { $match: { datePaiement: { $gte: debut, $lte: fin } } };
  const groupStage = { $group: { _id: null, total: { $sum: '$montant' } } };

  const [encaissementsResult, decaissementsResult] = await Promise.all([
      Paiement.aggregate([{ ...matchStage, ...{ $match: { ...matchStage.$match, sens: 'Entrant' } } }, groupStage ]),
      Paiement.aggregate([{ ...matchStage, ...{ $match: { ...matchStage.$match, sens: 'Sortant' } } }, groupStage ])
  ]);
  
  const totalEncaissements = encaissementsResult[0]?.total || 0;
  const totalDecaissements = decaissementsResult[0]?.total || 0;

  return {
    periode: { debut, fin },
    totalEncaissements: roundTo(totalEncaissements),
    totalDecaissements: roundTo(totalDecaissements),
    fluxNetDeTresorerie: roundTo(totalEncaissements - totalDecaissements),
  };
}

async function getPrevisionnelTresorerie(joursAPrevoir = 30) {
  const today = new Date();
  const dateLimite = new Date();
  dateLimite.setDate(today.getDate() + joursAPrevoir);

  const encaissementsPrevusPromise = Facture.aggregate([
    { $match: { 
        statut: { $in: [DOCUMENT_STATUS.ENVOYE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE, DOCUMENT_STATUS.EN_RETARD] }, 
        dateEcheance: { $gte: today, $lte: dateLimite } 
    } },
    { $group: { _id: null, total: { $sum: '$soldeDu' } } }
  ]);

  const decaissementsPrevusPromise = FactureAchat.aggregate([
    { $match: { 
        statut: { $in: [DOCUMENT_STATUS.BROUILLON, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE, DOCUMENT_STATUS.EN_RETARD] }, 
        dateEcheance: { $gte: today, $lte: dateLimite } 
    } },
    { $group: { _id: null, total: { $sum: '$soldeAPayer' } } }
  ]);
  
  const [encaissementsResult, decaissementsResult] = await Promise.all([
      encaissementsPrevusPromise, decaissementsPrevusPromise,
  ]);
  
  const totalEncaissementsPrevus = encaissementsResult[0]?.total || 0;
  const totalDecaissementsPrevus = decaissementsResult[0]?.total || 0;

  return {
    joursAPrevoir,
    dateLimite,
    totalEncaissementsPrevus: roundTo(totalEncaissementsPrevus),
    totalDecaissementsPrevus: roundTo(totalDecaissementsPrevus),
    soldePrevisionnel: roundTo(totalEncaissementsPrevus - totalDecaissementsPrevus),
  };
}

module.exports = {
  getSoldeTresorerieActuel,
  getTableauFluxTresorerie,
  getPrevisionnelTresorerie,
};