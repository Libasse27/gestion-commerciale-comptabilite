// ==============================================================================
//           Contrôleur pour la Consultation du Journal d'Audit
//
// Ce contrôleur gère les requêtes HTTP pour la lecture et la recherche
// dans le journal d'audit. Il est en lecture seule.
//
// Il utilise la classe `APIFeatures` pour permettre un filtrage et une
// pagination avancés des logs.
// ==============================================================================

const AuditLog = require('../../models/system/AuditLog');
const APIFeatures = require('../../utils/apiFeatures');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Récupérer toutes les entrées du journal d'audit (avec filtres et pagination)
 * @route   GET /api/v1/system/audit-logs
 * @access  Privé (Admin - permission: 'manage:settings' ou 'read:audit')
 */
exports.getAllAuditLogs = asyncHandler(async (req, res, next) => {
  // On peut filtrer par utilisateur, action, entité, etc.
  // Exemple d'URL : /audit-logs?user=...&action=UPDATE&page=1&limit=50
  
  const features = new APIFeatures(AuditLog.find(), req.query)
    .filter()
    .sort() // Tri par défaut sur -createdAt (les plus récents en premier)
    .limitFields()
    .paginate();
    
  const logs = await features.query
    .populate('user', 'firstName lastName email'); // Peuple l'utilisateur pour l'affichage

  // Exécuter une deuxième requête pour obtenir le nombre total de documents
  // qui correspondent au filtre, SANS la pagination.
  const totalFeatures = new APIFeatures(AuditLog.find(), req.query).filter();
  const totalLogs = await totalFeatures.query.countDocuments();


  res.status(200).json({
    status: 'success',
    results: logs.length,
    pagination: {
        total: totalLogs,
        limit: parseInt(req.query.limit) || 100,
        page: parseInt(req.query.page) || 1,
        pages: Math.ceil(totalLogs / (parseInt(req.query.limit) || 100)),
    },
    data: {
      logs,
    },
  });
});