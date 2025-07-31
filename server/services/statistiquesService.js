// ==============================================================================
//           Service pour les Statistiques et Rapports Commerciaux
//
// Ce service est le point d'entrée unique pour tous les calculs analytiques
// et les agrégations de données commerciales.
//
// Il utilise le "Aggregation Framework" de MongoDB pour générer des KPIs
// et des données de rapport de manière performante.
// ==============================================================================

const mongoose = require('mongoose');
const Facture = require('../models/commercial/Facture');
const Devis = require('../models/commercial/Devis');
const Client = require('../models/commercial/Client');
const Commande = require('../models/commercial/Commande');
const { getStartOfDay, getEndOfDay } = require('../utils/dateUtils');
const { DOCUMENT_STATUS } = require('../utils/constants');

/**
 * Calcule les KPIs commerciaux principaux pour une période donnée.
 * @param {Date} dateDebut
 * @param {Date} dateFin
 * @returns {Promise<object>} Un objet contenant les KPIs.
 */
async function getKpisCommerciaux(dateDebut, dateFin) {
  const statutsPayes = [DOCUMENT_STATUS.PAYEE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE];

  const caPromise = Facture.aggregate([
    { $match: { statut: { $in: statutsPayes }, dateEmission: { $gte: dateDebut, $lte: dateFin } } },
    { $group: { _id: null, total: { $sum: '$totalTTC' } } }
  ]);

  const nouveauxClientsPromise = Client.countDocuments({ createdAt: { $gte: dateDebut, $lte: dateFin } });
  
  const devisCreesPromise = Devis.countDocuments({ createdAt: { $gte: dateDebut, $lte: dateFin } });
  
  const devisConvertisPromise = Devis.countDocuments({ 
      statut: 'converti', // ou un statut similaire
      updatedAt: { $gte: dateDebut, $lte: dateFin } 
  });

  const [caResult, nouveauxClients, devisCrees, devisConvertis] = await Promise.all([
    caPromise, nouveauxClientsPromise, devisCreesPromise, devisConvertisPromise
  ]);
  
  const tauxConversionDevis = devisCrees > 0 ? (devisConvertis / devisCrees) * 100 : 0;

  return {
    chiffreAffaires: caResult[0]?.total || 0,
    nouveauxClients: nouveauxClients,
    devisCrees: devisCrees,
    tauxConversionDevis: parseFloat(tauxConversionDevis.toFixed(2)),
  };
}


/**
 * Calcule les données de ventes mensuelles sur les 12 derniers mois.
 * @returns {Promise<Array<object>>}
 */
async function getVentesAnnuelles() {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const statutsPayes = [DOCUMENT_STATUS.PAYEE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE];

    const monthlySales = await Facture.aggregate([
        { $match: { dateEmission: { $gte: oneYearAgo }, statut: { $in: statutsPayes } } },
        { $group: {
                _id: { year: { $year: "$dateEmission" }, month: { $month: "$dateEmission" } },
                totalVentes: { $sum: "$totalTTC" }
            }},
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        { $project: {
                _id: 0,
                date: { $dateFromParts: { 'year': '$_id.year', 'month': '$_id.month', 'day': 1 } },
                chiffreAffaires: "$totalVentes"
            }}
    ]);
    return monthlySales;
}

/**
 * Calcule les KPIs pour un client spécifique.
 */
async function getKpisForClient(clientId) {
  const clientObjectId = new mongoose.Types.ObjectId(clientId);

  const caPromise = Facture.aggregate([
    { $match: { client: clientObjectId, statut: { $in: [DOCUMENT_STATUS.PAYEE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE] } } },
    { $group: { _id: null, total: { $sum: '$totalTTC' } } }
  ]);
  
  const impayesPromise = Facture.aggregate([
    { $match: { client: clientObjectId, statut: { $in: [DOCUMENT_STATUS.ENVOYE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE, DOCUMENT_STATUS.EN_RETARD] } } },
    { $group: { _id: null, total: { $sum: '$soldeDu' } } }
  ]);
  
  const commandesPromise = Commande.countDocuments({ client: clientId });

  const [caResult, impayesResult, commandesCount] = await Promise.all([caPromise, impayesPromise, commandesPromise]);

  return {
    chiffreAffairesTotal: caResult[0]?.total || 0,
    totalImpaye: impayesResult[0]?.total || 0,
    nombreCommandes: commandesCount,
  };
}


module.exports = {
  getKpisCommerciaux,
  getVentesAnnuelles,
  getKpisForClient,
};