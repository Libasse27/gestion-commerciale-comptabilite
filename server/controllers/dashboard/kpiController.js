// ==============================================================================
//           Contrôleur pour les Indicateurs de Performance Clés (KPIs)
//
// MISE À JOUR : Ce contrôleur délègue maintenant toute la logique de calcul
// aux services spécialisés (`statistiquesService`, `tresorerieService`),
// se contentant d'orchestrer les appels et de formater la réponse HTTP.
// ==============================================================================

// --- Import des Services ---
const statistiquesService = require('../../services/statistiquesService');
const tresorerieService = require('../../services/paiements/tresorerieService');
const asyncHandler = require('../../utils/asyncHandler');
const { getStartOfDay, getEndOfDay } = require('../../utils/dateUtils');

/**
 * @desc    Récupérer les KPIs commerciaux principaux
 * @route   GET /api/v1/kpis/commerciaux
 * @access  Privé (permission: 'read:rapport')
 */
exports.getKpisCommerciaux = asyncHandler(async (req, res, next) => {
  // Déterminer la période. Par défaut, la journée en cours.
  // Peut être surchargée par des query params (ex: ?dateDebut=...&dateFin=...)
  const dateDebut = req.query.dateDebut ? getStartOfDay(new Date(req.query.dateDebut)) : getStartOfDay(new Date());
  const dateFin = req.query.dateFin ? getEndOfDay(new Date(req.query.dateFin)) : getEndOfDay(new Date());

  // Appeler le service qui contient la logique de calcul
  const kpis = await statistiquesService.getKpisCommerciaux(dateDebut, dateFin);

  res.status(200).json({
    status: 'success',
    data: { kpis },
  });
});


/**
 * @desc    Récupérer les KPIs de trésorerie
 * @route   GET /api/v1/kpis/tresorerie
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getKpisTresorerie = asyncHandler(async (req, res, next) => {
  // Appeler les fonctions du service de trésorerie
  const soldeActuelPromise = tresorerieService.getSoldeTresorerieActuel();
  const previsionnelPromise = tresorerieService.getPrevisionnelTresorerie(30);

  const [soldeActuel, previsionnel] = await Promise.all([
      soldeActuelPromise,
      previsionnelPromise,
  ]);

  const kpis = {
    soldeTresorerieActuel: soldeActuel,
    totalEncaissementsPrevus30j: previsionnel.totalEncaissementsPrevus,
    totalDecaissementsPrevus30j: previsionnel.totalDecaissementsPrevus,
  };
    
  res.status(200).json({
    status: 'success',
    data: { kpis },
  });
});