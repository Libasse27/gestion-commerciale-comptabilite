// server/services/comptabilite/balanceService.js
const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const CompteComptable = require('../../models/comptabilite/CompteComptable');
const AppError = require('../../utils/appError');
const mongoose = require('mongoose');
const { roundTo } = require('../../utils/numberUtils');

async function genererBalanceGenerale({ dateDebut, dateFin }) {
  const debut = new Date(dateDebut);
  const fin = new Date(dateFin);

  if (!debut || !fin || debut >= fin) {
    throw new AppError('Veuillez fournir une période de dates valide.', 400);
  }

  const pipeline = [
    { $unwind: '$lignes' },
    { $lookup: { from: 'comptabilite_plan', localField: 'lignes.compte', foreignField: '_id', as: 'compteInfo' } },
    { $unwind: '$compteInfo' },
    {
      $group: {
        _id: '$lignes.compte',
        numero: { $first: '$compteInfo.numero' },
        libelle: { $first: '$compteInfo.libelle' },
        debitOuverture: { $sum: { $cond: [{ $lt: ['$date', debut] }, '$lignes.debit', 0] } },
        creditOuverture: { $sum: { $cond: [{ $lt: ['$date', debut] }, '$lignes.credit', 0] } },
        debitMouvement: { $sum: { $cond: [{ $and: [{ $gte: ['$date', debut] }, { $lte: ['$date', fin] }] }, '$lignes.debit', 0] } },
        creditMouvement: { $sum: { $cond: [{ $and: [{ $gte: ['$date', debut] }, { $lte: ['$date', fin] }] }, '$lignes.credit', 0] } },
      }
    },
    {
      $project: {
        _id: 0, numero: 1, libelle: 1,
        soldeDebitOuverture: { $cond: [{ $gt: ['$debitOuverture', '$creditOuverture'] }, { $subtract: ['$debitOuverture', '$creditOuverture'] }, 0] },
        soldeCreditOuverture: { $cond: [{ $lt: ['$debitOuverture', '$creditOuverture'] }, { $subtract: ['$creditOuverture', '$debitOuverture'] }, 0] },
        debitMouvement: 1, creditMouvement: 1,
        soldeDebitFinal: { $let: { vars: { solde: { $add: [{ $subtract: ['$debitOuverture', '$creditOuverture'] }, { $subtract: ['$debitMouvement', '$creditMouvement'] }] } }, in: { $cond: [{ $gt: ['$$solde', 0] }, '$$solde', 0] } } },
        soldeCreditFinal: { $let: { vars: { solde: { $add: [{ $subtract: ['$debitOuverture', '$creditOuverture'] }, { $subtract: ['$debitMouvement', '$creditMouvement'] }] } }, in: { $cond: [{ $lt: ['$$solde', 0] }, { $multiply: ['$$solde', -1] }, 0] } } },
      }
    },
    { $match: { $or: [ { soldeDebitOuverture: { $ne: 0 } }, { soldeCreditOuverture: { $ne: 0 } }, { debitMouvement: { $ne: 0 } }, { creditMouvement: { $ne: 0 } } ] } },
    { $sort: { numero: 1 } }
  ];

  const balanceData = await EcritureComptable.aggregate(pipeline);

  const totaux = balanceData.reduce((acc, ligne) => {
    acc.soldeDebitOuverture += ligne.soldeDebitOuverture;
    acc.soldeCreditOuverture += ligne.soldeCreditOuverture;
    acc.debitMouvement += ligne.debitMouvement;
    acc.creditMouvement += ligne.creditMouvement;
    acc.soldeDebitFinal += ligne.soldeDebitFinal;
    acc.soldeCreditFinal += ligne.soldeCreditFinal;
    return acc;
  }, { soldeDebitOuverture: 0, soldeCreditOuverture: 0, debitMouvement: 0, creditMouvement: 0, soldeDebitFinal: 0, soldeCreditFinal: 0 });

  return {
      periode: { dateDebut, dateFin },
      lignes: balanceData.map(l => Object.fromEntries(Object.entries(l).map(([key, value]) => [key, typeof value === 'number' ? roundTo(value) : value]))),
      totaux: Object.fromEntries(Object.entries(totaux).map(([key, value]) => [key, roundTo(value)]))
  };
}

module.exports = { genererBalanceGenerale };