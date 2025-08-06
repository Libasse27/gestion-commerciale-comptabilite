const mongoose = require('mongoose');
const Facture = require('../../models/commercial/Facture');
const Devis = require('../../models/commercial/Devis');
const Client = require('../../models/commercial/Client');
const Commande = require('../../models/commercial/Commande');
const { DOCUMENT_STATUS } = require('../../utils/constants');

const _calculateChange = (current, previous) => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return parseFloat((((current - previous) / previous) * 100).toFixed(2));
};

async function getKpisCommerciaux(periodeActuelle) {
  const { dateDebut, dateFin } = periodeActuelle;

  const dureePeriode = dateFin.getTime() - dateDebut.getTime();
  const dateFinPrecedente = new Date(dateDebut.getTime() - 1);
  const dateDebutPrecedente = new Date(dateFinPrecedente.getTime() - dureePeriode);

  const statutsPayes = [DOCUMENT_STATUS.PAYEE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE];

  const results = await Facture.aggregate([
    { $match: { statut: { $in: statutsPayes }, dateEmission: { $gte: dateDebutPrecedente, $lte: dateFin } } },
    { $group: {
        _id: null,
        caActuel: { $sum: { $cond: [{ $gte: ['$dateEmission', dateDebut] }, '$totalTTC', 0] } },
        caPrecedent: { $sum: { $cond: [{ $lt: ['$dateEmission', dateDebut] }, '$totalTTC', 0] } }
    }}
  ]);

  const kpisCA = results[0] || { caActuel: 0, caPrecedent: 0 };
  
  const [nouveauxClientsActuel, nouveauxClientsPrecedent, devisEnAttente] = await Promise.all([
      Client.countDocuments({ createdAt: { $gte: dateDebut, $lte: dateFin } }),
      Client.countDocuments({ createdAt: { $gte: dateDebutPrecedente, $lte: dateFinPrecedente } }),
      Devis.countDocuments({ statut: DOCUMENT_STATUS.ENVOYE }),
  ]);

  return {
    chiffreAffaires: { value: kpisCA.caActuel, change: _calculateChange(kpisCA.caActuel, kpisCA.caPrecedent) },
    nouveauxClients: { value: nouveauxClientsActuel, change: _calculateChange(nouveauxClientsActuel, nouveauxClientsPrecedent) },
    devisEnAttente: { value: devisEnAttente },
  };
}

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
    
    return {
        labels: monthlySales.map(d => new Date(d.date).toLocaleString('fr-SN', { month: 'short', year: '2-digit' })),
        datasets: [{ label: 'Chiffre d\'affaires', data: monthlySales.map(d => d.chiffreAffaires) }]
    };
}

async function getKpisForClient(clientId) {
  const clientObjectId = new mongoose.Types.ObjectId(clientId);
  const statutsPayes = [DOCUMENT_STATUS.PAYEE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE];

  const [caResult, impayesResult, commandesCount] = await Promise.all([
    Facture.aggregate([
        { $match: { client: clientObjectId, statut: { $in: statutsPayes } } },
        { $group: { _id: null, total: { $sum: '$totalTTC' } } }
    ]),
    Facture.aggregate([
        { $match: { client: clientObjectId, statut: { $in: [DOCUMENT_STATUS.ENVOYE, DOCUMENT_STATUS.PARTIELLEMENT_PAYEE, DOCUMENT_STATUS.EN_RETARD] } } },
        { $group: { _id: null, total: { $sum: '$soldeDu' } } }
    ]),
    Commande.countDocuments({ client: clientObjectId })
  ]);

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