// ==============================================================================
//           Contrôleur pour les Statistiques et Rapports Commerciaux
//
// Ce contrôleur gère les requêtes HTTP qui nécessitent des calculs et des
// agrégations de données pour fournir des indicateurs de performance (KPIs)
// et des données pour les tableaux de bord.
//
// Il utilise le puissant "Aggregation Framework" de MongoDB.
// ==============================================================================

const Facture = require('../../models/commercial/Facture');
const Devis = require('../../models/commercial/Devis');
const Client = require('../../models/commercial/Client');
const asyncHandler = require('../../utils/asyncHandler');
const { getStartOfDay, getEndOfDay } = require('../../utils/dateUtils');

/**
 * @desc    Récupérer les KPIs principaux pour le tableau de bord commercial
 * @route   GET /api/v1/statistiques/kpis-commerciaux
 * @access  Privé (permission: 'read:rapport')
 */
exports.getKpisCommerciaux = asyncHandler(async (req, res, next) => {
  // --- 1. Calcul du Chiffre d'Affaires (CA) sur différentes périodes ---
  // On se base sur les factures payées ou partiellement payées
  const todayStart = getStartOfDay(new Date());
  const todayEnd = getEndOfDay(new Date());

  const caAujourdhuiPromise = Facture.aggregate([
    { $match: { statut: { $in: ['payee', 'partiellement_payee'] }, createdAt: { $gte: todayStart, $lte: todayEnd } } },
    { $group: { _id: null, total: { $sum: '$totalTTC' } } }
  ]);

  const caTotalPromise = Facture.aggregate([
    { $match: { statut: { $in: ['payee', 'partiellement_payee'] } } },
    { $group: { _id: null, total: { $sum: '$totalTTC' } } }
  ]);
  
  // --- 2. Nombre de nouveaux clients aujourd'hui ---
  const nouveauxClientsPromise = Client.countDocuments({ createdAt: { $gte: todayStart, $lte: todayEnd } });

  // --- 3. Nombre de devis en attente ---
  const devisEnAttentePromise = Devis.countDocuments({ statut: 'envoyee' });

  // --- Exécution de toutes les requêtes en parallèle pour la performance ---
  const [
    caAujourdhuiResult,
    caTotalResult,
    nouveauxClients,
    devisEnAttente,
  ] = await Promise.all([
    caAujourdhuiPromise,
    caTotalPromise,
    nouveauxClientsPromise,
    devisEnAttentePromise,
  ]);
  
  // --- Formatage des résultats ---
  const kpis = {
    chiffreAffairesAujourdhui: caAujourdhuiResult[0]?.total || 0,
    chiffreAffairesTotal: caTotalResult[0]?.total || 0,
    nouveauxClientsAujourdhui: nouveauxClients,
    devisEnAttente: devisEnAttente,
  };

  res.status(200).json({
    status: 'success',
    data: {
      kpis,
    },
  });
});


/**
 * @desc    Récupérer les données pour le graphique des ventes sur les 12 derniers mois
 * @route   GET /api/v1/statistiques/ventes-annuelles
 * @access  Privé (permission: 'read:rapport')
 */
exports.getVentesAnnuelles = asyncHandler(async (req, res, next) => {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const monthlySales = await Facture.aggregate([
        // 1. Filtrer les factures des 12 derniers mois
        { $match: { dateEmission: { $gte: oneYearAgo }, statut: { $in: ['payee', 'partiellement_payee'] } } },
        // 2. Grouper par année et par mois
        {
            $group: {
                _id: {
                    year: { $year: "$dateEmission" },
                    month: { $month: "$dateEmission" }
                },
                totalVentes: { $sum: "$totalTTC" }
            }
        },
        // 3. Trier par date
        { $sort: { "_id.year": 1, "_id.month": 1 } },
        // 4. Projeter pour un format plus simple
        {
            $project: {
                _id: 0,
                date: { $concat: [ { $toString: "$_id.year" }, "-", { $toString: "$_id.month" } ] },
                chiffreAffaires: "$totalVentes"
            }
        }
    ]);
    
    res.status(200).json({
        status: 'success',
        data: {
            ventesMensuelles: monthlySales
        }
    });
});