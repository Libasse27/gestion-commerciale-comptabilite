// server/controllers/auth/roleController.js
// ==============================================================================
//           Contrôleur pour la Gestion des Rôles (RBAC)
//
// Ce contrôleur gère les requêtes HTTP pour les opérations CRUD sur les rôles.
// Il délègue toute la logique métier au `permissionService`.
// ==============================================================================

const permissionService = require('../../services/auth/permissionService');
const Role = require('../../models/auth/Role');
const Permission = require('../../models/auth/Permission');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const APIFeatures = require('../../utils/apiFeatures');

/**
 * @desc    Créer un nouveau rôle
 * @route   POST /api/v1/roles
 * @access  Privé (permission: 'role:manage')
 */
exports.createRole = asyncHandler(async (req, res, next) => {
  const newRole = await permissionService.createRole(req.body);

  res.status(201).json({
    status: 'success',
    data: {
      role: newRole,
    },
  });
});

/**
 * @desc    Récupérer tous les rôles
 * @route   GET /api/v1/roles
 * @access  Privé (permission: 'role:manage')
 */
exports.getAllRoles = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(Role.find().populate('permissions', 'name description group'), req.query)
    .sort()
    .paginate();
  
  const roles = await features.query;

  res.status(200).json({
    status: 'success',
    results: roles.length,
    data: {
      roles,
    },
  });
});

/**
 * @desc    Récupérer tous les permissions, groupées
 * @route   GET /api/v1/roles/permissions
 * @access  Privé (permission: 'role:manage')
 */
exports.getAllPermissions = asyncHandler(async (req, res, next) => {
    const permissions = await Permission.find().sort('group name');
    // Regrouper par le champ 'group'
    const groupedPermissions = permissions.reduce((acc, p) => {
        acc[p.group] = acc[p.group] || [];
        acc[p.group].push(p);
        return acc;
    }, {});

    res.status(200).json({
        status: 'success',
        data: {
            permissions: groupedPermissions,
        }
    });
});

/**
 * @desc    Récupérer un rôle par son ID
 * @route   GET /api/v1/roles/:id
 * @access  Privé (permission: 'role:manage')
 */
exports.getRoleById = asyncHandler(async (req, res, next) => {
  const role = await Role.findById(req.params.id).populate('permissions', 'name description group');

  if (!role) {
    return next(new AppError('Aucun rôle trouvé avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      role,
    },
  });
});

/**
 * @desc    Mettre à jour un rôle
 * @route   PATCH /api/v1/roles/:id
 * @access  Privé (permission: 'role:manage')
 */
exports.updateRole = asyncHandler(async (req, res, next) => {
  const updatedRole = await permissionService.updateRolePermissions(req.params.id, req.body);
  const populatedRole = await Role.findById(updatedRole._id).populate('permissions', 'name description group');

  res.status(200).json({
    status: 'success',
    data: {
      role: populatedRole,
    },
  });
});

/**
 * @desc    Supprimer un rôle
 * @route   DELETE /api/v1/roles/:id
 * @access  Privé (permission: 'role:manage')
 */
exports.deleteRole = asyncHandler(async (req, res, next) => {
  await permissionService.deleteRole(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});