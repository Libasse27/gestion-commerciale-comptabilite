// ==============================================================================
//           Service pour l'Analyse de la Trésorerie
//
// Ce service fournit des fonctions pour analyser l'état et les flux de
// trésorerie de l'entreprise. Il est purement analytique et ne modifie
// aucune donnée.
//
// Il agrège les données des paiements, des factures de vente et des
// factures d'achat pour construire des rapports de trésorerie.
// ==============================================================================

const Paiement = require('../../models/paiements/Paiement');
const Facture = require('../../models/commercial/Facture');
const FactureAchat = require('../../models/commercial/FactureAchat');
const CompteComptable = require('../../models/comptabilite/CompteComptable');
const AppError = require('../../utils/appError');
const numberUtils = require('../../utils/numberUtils');

/**
 * Calcule le solde de trésorerie actuel en se basant sur les soldes
 * des comptes de trésorerie (Classe 5).
 * @returns {Promise<number>} Le solde de trésorerie total.
 */
async function getSoldeTresorerieActuel() {
  // On agrège les soldes de tous les comptes de type 'Tresorerie'
  // Note : cette méthode suppose que les soldes des comptes sont mis à jour
  // en temps réel, ce qui nécessite une logique comptable plus poussée.
  
  // Une méthode plus directe est de sommer les paiements.
  const result = await Paiement.aggregate([
    {
      $group: {
        _id: '$sens', // Grouper par 'Entrant' ou 'Sortant'
        total: { $sum: '$montant' }
      }
    }
  ]);

  const totalEntrant = result.find(r => r._id === 'Entrant')?.total || 0;
  const totalSortant = result.find(r => r._id === 'Sortant')?.total || 0;

  return numberUtils.roundTo(totalEntrant - totalSortant);
}


/**
 * Génère un tableau de flux de trésorerie simplifié pour une période.
 * @param {Date} dateDebut
 * @param {Date} dateFin
 * @returns {Promise<object>}
 */
async function getTableauFluxTresorerie(dateDebut, dateFin) {
  // Flux entrants (encaissements)
  const encaissementsPromise = Paiement.aggregate([
    { $match: { sens: 'Entrant', datePaiement: { $gte: dateDebut, $lte: dateFin } } },
    { $group: { _id: null, total: { $sum: '$montant' } } }
  ]);
  
  // Flux sortants (décaissements)
  const decaissementsPromise = Paiement.aggregate([
    { $match: { sens: 'Sortant', datePaiement: { $gte: dateDebut, $lte: dateFin } } },
    { $group: { _id: null, total: { $sum: '$montant' } } }
  ]);
  
  const [encaissementsResult, decaissementsResult] = await Promise.all([
      encaissementsPromise,
      decaissementsPromise
  ]);
  
  const totalEncaissements = encaissementsResult[0]?.total || 0;
  const totalDecaissements = decaissementsResult[0]?.total || 0;
  const fluxNet = totalEncaissements - totalDecaissements;

  return {
    periode: { debut: dateDebut, fin: dateFin },
    totalEncaissements: numberUtils.roundTo(totalEncaissements),
    totalDecaissements: numberUtils.roundTo(totalDecaissements),
    fluxNetDeTresorerie: numberUtils.roundTo(fluxNet),
  };
}


/**
 * Calcule un prévisionnel de trésorerie en se basant sur les factures non soldées.
 * @param {number} joursAPrevoir - Le nombre de jours dans le futur à inclure.
 * @returns {Promise<object>}
 */
async function getPrevisionnelTresorerie(joursAPrevoir = 30) {
  const today = new Date();
  const dateLimite = new Date();
  dateLimite.setDate(today.getDate() + joursAPrevoir);

  // 1. Prévisions d'encaissements (ce que les clients nous doivent)
  const encaissementsPrevusPromise = Facture.aggregate([
    { $match: { statut: { $in: ['envoyee', 'partiellement_payee', 'en_retard'] }, dateEcheance: { $lte: dateLimite } } },
    { $group: { _id: null, total: { $sum: '$soldeDu' } } }
  ]);

  // 2. Prévisions de décaissements (ce que nous devons aux fournisseurs)
  const decaissementsPrevusPromise = FactureAchat.aggregate([
    { $match: { statut: { $in: ['brouillon', 'partiellement_payee', 'en_retard'] }, dateEcheance: { $lte: dateLimite } } },
    { $group: { _id: null, total: { $sum: '$soldeAPayer' } } }
  ]);
  
  const [encaissementsResult, decaissementsResult] = await Promise.all([
      encaissementsPrevusPromise,
      decaissementsPrevusPromise,
  ]);
  
  const totalEncaissementsPrevus = encaissementsResult[0]?.total || 0;
  const totalDecaissementsPrevus = decaissementsResult[0]?.total || 0;

  return {
    joursAPrevoir,
    dateLimite,
    totalEncaissementsPrevus: numberUtils.roundTo(totalEncaissementsPrevus),
    totalDecaissementsPrevus: numberUtils.roundTo(totalDecaissementsPrevus),
    soldePrevisionnel: numberUtils.roundTo(totalEncaissementsPrevus - totalDecaissementsPrevus),
  };
}


module.exports = {
  getSoldeTresorerieActuel,
  getTableauFluxTresorerie,
  getPrevisionnelTresorerie,
};