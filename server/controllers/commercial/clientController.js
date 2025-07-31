// ==============================================================================
//           Contrôleur pour la Gestion des Clients (CRUD & Actions)
//
// MISE À JOUR : Utilisation complète de `APIFeatures` pour la recherche
// et renvoi des métadonnées de pagination complètes.
// ==============================================================================

const Client = require('../../models/commercial/Client');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');
const auditLogService = require('../../services/system/auditLogService');
const excelService = require('../../services/exports/excelService');
const { AUDIT_LOG_ACTIONS } = require('../../utils/constants');

/**
 * @desc    Créer un nouveau client
 * @route   POST /api/v1/clients
 */
exports.createClient = asyncHandler(async (req, res, next) => {
  const newClient = await Client.create({ ...req.body, creePar: req.user.id });

  auditLogService.logAction({
    user: req.user.id, action: AUDIT_LOG_ACTIONS.CREATE, entity: 'Client',
    entityId: newClient._id, status: 'SUCCESS', ipAddress: req.ip,
  });

  res.status(201).json({ status: 'success', data: { client: newClient } });
});


/**
 * @desc    Récupérer tous les clients (avec filtres, tri, recherche, pagination)
 * @route   GET /api/v1/clients
 */
exports.getAllClients = asyncHandler(async (req, res, next) => {
  const searchableFields = ['nom', 'codeClient', 'email', 'telephone'];
  const baseQuery = Client.find({ isActive: true });

  // 1. Obtenir le nombre total de documents qui correspondent aux filtres (AVANT la pagination)
  const countFeatures = new APIFeatures(baseQuery.clone(), req.query)
      .filter().search(searchableFields);
  const totalClients = await countFeatures.query.countDocuments();

  // 2. Appliquer toutes les fonctionnalités, y compris la pagination
  const features = new APIFeatures(baseQuery, req.query)
    .filter()
    .sort()
    .search(searchableFields)
    .limitFields()
    .paginate();
  
  const clients = await features.query.populate('creePar', 'firstName lastName');

  // 3. Envoyer la réponse avec les métadonnées de pagination
  const limit = parseInt(req.query.limit) || 10;
  res.status(200).json({
    status: 'success',
    results: clients.length,
    pagination: {
        total: totalClients,
        limit: limit,
        page: parseInt(req.query.page) || 1,
        pages: Math.ceil(totalClients / limit),
    },
    data: { clients },
  });
});


/**
 * @desc    Récupérer un client par son ID
 * @route   GET /api/v1/clients/:id
 */
exports.getClientById = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);
  if (!client) {
    return next(new AppError('Aucun client trouvé avec cet identifiant.', 404));
  }
  res.status(200).json({ status: 'success', data: { client } });
});


/**
 * @desc    Mettre à jour un client
 * @route   PATCH /api/v1/clients/:id
 */
exports.updateClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!client) {
    return next(new AppError('Aucun client trouvé avec cet identifiant.', 404));
  }
  auditLogService.logAction({
    user: req.user.id, action: AUDIT_LOG_ACTIONS.UPDATE, entity: 'Client',
    entityId: client._id, status: 'SUCCESS', ipAddress: req.ip,
    details: { changes: req.body }
  });
  res.status(200).json({ status: 'success', data: { client } });
});


/**
 * @desc    Désactiver un client (soft delete)
 * @route   DELETE /api/v1/clients/:id
 */
exports.deleteClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findByIdAndUpdate(req.params.id, { isActive: false });
  if (!client) {
    return next(new AppError('Aucun client trouvé avec cet identifiant.', 404));
  }
  auditLogService.logAction({
    user: req.user.id, action: AUDIT_LOG_ACTIONS.DELETE, entity: 'Client',
    entityId: client._id, status: 'SUCCESS', ipAddress: req.ip,
  });
  res.status(204).json({ status: 'success', data: null });
});


/**
 * @desc    Exporter la liste des clients en Excel
 * @route   GET /api/v1/clients/export/excel
 */
exports.exportClients = asyncHandler(async (req, res, next) => {
    const searchableFields = ['nom', 'codeClient', 'email', 'telephone'];
    const features = new APIFeatures(Client.find({ isActive: true }), req.query)
        .filter().sort().search(searchableFields).limitFields();

    const clients = await features.query;
    const excelBuffer = await excelService.exportClientsToExcel(clients);
    const filename = `export-clients-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);

    auditLogService.logAction({
        user: req.user.id, action: AUDIT_LOG_ACTIONS.EXPORT, entity: 'Client',
        status: 'SUCCESS', ipAddress: req.ip, details: `Export de ${clients.length} clients.`
    });

    res.send(excelBuffer);
});