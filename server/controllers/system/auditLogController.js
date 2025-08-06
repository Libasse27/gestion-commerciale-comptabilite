// server/controllers/system/auditLogController.js
const AuditLog = require('../../models/system/AuditLog');
const APIFeatures = require('../../utils/apiFeatures');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Récupérer les entrées du journal d'audit avec filtres et pagination
 * @route   GET /api/v1/system/audit-logs
 */
exports.getAllAuditLogs = asyncHandler(async (req, res, next) => {
  const baseQuery = AuditLog.find().populate('user', 'firstName lastName email');

  // 1. Obtenir le nombre total de documents correspondant aux filtres
  const totalFeatures = new APIFeatures(baseQuery.clone(), req.query).filter();
  const totalLogs = await totalFeatures.query.countDocuments();

  // 2. Obtenir la page de données actuelle
  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .sort() // Tri par défaut sur -createdAt
    .paginate();
    
  const logs = await features.query;

  // 3. Envoyer la réponse
  const limit = parseInt(req.query.limit) || 20;
  res.status(200).json({
    status: 'success',
    results: logs.length,
    pagination: {
        total: totalLogs,
        limit,
        page: parseInt(req.query.page) || 1,
        pages: Math.ceil(totalLogs / limit),
    },
    data: { logs },
  });
});