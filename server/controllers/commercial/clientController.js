const Client = require('../../models/commercial/Client');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');
const auditLogService = require('../../services/system/auditLogService');
const excelService = require('../../services/exports/excelService');

exports.createClient = asyncHandler(async (req, res, next) => {
  const newClient = await Client.create({ ...req.body, creePar: req.user.id });
  auditLogService.logCreate({ user: req.user.id, entity: 'Client', entityId: newClient._id, ipAddress: req.ip });
  res.status(201).json({ status: 'success', data: { client: newClient } });
});

exports.getAllClients = asyncHandler(async (req, res, next) => {
  const searchableFields = ['nom', 'codeClient', 'email', 'telephone'];
  const baseQuery = Client.find({ isActive: true });

  const totalFeatures = new APIFeatures(baseQuery.clone(), req.query).filter().search(searchableFields);
  const totalClients = await totalFeatures.query.countDocuments();

  const features = new APIFeatures(baseQuery, req.query)
    .filter().sort().search(searchableFields).limitFields().paginate();
  
  const clients = await features.query.populate('creePar', 'firstName lastName');

  const limit = parseInt(req.query.limit) || 20;
  res.status(200).json({
    status: 'success',
    results: clients.length,
    pagination: {
        total: totalClients,
        limit,
        page: parseInt(req.query.page) || 1,
        pages: Math.ceil(totalClients / limit),
    },
    data: { clients },
  });
});

exports.getClientById = asyncHandler(async (req, res, next) => {
  const client = await Client.findById(req.params.id);
  if (!client) return next(new AppError('Aucun client trouvé avec cet ID.', 404));
  res.status(200).json({ status: 'success', data: { client } });
});

exports.updateClient = asyncHandler(async (req, res, next) => {
  const clientBefore = await Client.findById(req.params.id).lean();
  if (!clientBefore) return next(new AppError('Aucun client trouvé avec cet ID.', 404));
  
  const updatedClient = await Client.findByIdAndUpdate(req.params.id, { ...req.body, modifiePar: req.user.id }, { new: true, runValidators: true });
  
  auditLogService.logUpdate({ user: req.user.id, entity: 'Client', entityId: updatedClient._id, ipAddress: req.ip }, clientBefore, updatedClient.toObject());
  res.status(200).json({ status: 'success', data: { client: updatedClient } });
});

exports.deleteClient = asyncHandler(async (req, res, next) => {
  const client = await Client.findByIdAndUpdate(req.params.id, { isActive: false, modifiePar: req.user.id });
  if (!client) return next(new AppError('Aucun client trouvé avec cet ID.', 404));

  auditLogService.logUpdate({ user: req.user.id, entity: 'Client', entityId: client._id, ipAddress: req.ip }, { isActive: true }, { isActive: false });
  res.status(204).json({ status: 'success', data: null });
});

exports.exportClients = asyncHandler(async (req, res, next) => {
    const searchableFields = ['nom', 'codeClient', 'email', 'telephone'];
    const features = new APIFeatures(Client.find({ isActive: true }), req.query)
        .filter().sort().search(searchableFields).limitFields();

    const clients = await features.query.lean();
    const excelBuffer = excelService.exportClientsToExcel(clients);
    const filename = `export-clients-${new Date().toISOString().split('T')[0]}.xlsx`;
    
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    auditLogService.logSystemEvent({
        user: req.user.id, action: 'EXPORT', entity: 'Client', status: 'SUCCESS',
        ipAddress: req.ip, details: `Export de ${clients.length} clients.`
    });

    res.send(excelBuffer);
});