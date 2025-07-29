// ==============================================================================
//           Contrôleur pour la Gestion des Clients (CRUD & Actions)
//
// MISE À JOUR : Ajout d'une fonction pour l'export de la liste des clients
// au format Excel (.xlsx).
// ==============================================================================

const Client = require('../../models/commercial/Client');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');
const auditLogService = require('../../services/system/auditLogService');
const excelService = require('../../services/exports/excelService'); // Import du service Excel
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
 * @desc    Récupérer tous les clients (avec filtres, tri, pagination)
 * @route   GET /api/v1/clients
 */
exports.getAllClients = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Client.find({ isActive: true }), req.query)
    .filter().sort().limitFields().paginate();
  
  const clients = await features.query.populate('creePar', 'firstName lastName');

  // TODO: Ajouter un en-tête avec le nombre total de documents pour la pagination
  // const total = await Client.countDocuments(features.query.getFilter());

  res.status(200).json({
    status: 'success',
    results: clients.length,
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
    // 1. Récupérer toutes les données à exporter, en appliquant les mêmes filtres
    //    que `getAllClients` mais SANS la pagination.
    const features = new APIFeatures(Client.find({ isActive: true }), req.query)
        .filter().sort().limitFields();

    const clients = await features.query;
    
    // 2. Déléguer la création du fichier buffer au service Excel
    const excelBuffer = await excelService.exportClientsToExcel(clients);
    
    const filename = `export-clients-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // 3. Configurer les en-têtes de la réponse pour le téléchargement
    res.setHeader(
        'Content-Type',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
        'Content-Disposition',
        `attachment; filename=${filename}`
    );

    // 4. Logger l'action d'export
    auditLogService.logAction({
        user: req.user.id, action: AUDIT_LOG_ACTIONS.EXPORT, entity: 'Client',
        status: 'SUCCESS', ipAddress: req.ip,
        details: `Export de ${clients.length} clients.`
    });

    // 5. Envoyer le buffer
    res.send(excelBuffer);
});