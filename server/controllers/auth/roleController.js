// ==============================================================================
//           Contrôleur pour la Gestion des Rôles (RBAC)
//
// Ce contrôleur gère les requêtes HTTP pour les opérations CRUD sur les rôles.
// Il est conçu pour être "mince" (thin controller) : il délègue toute la
// logique métier au `permissionService` et se contente de gérer le cycle
// de vie de la requête/réponse HTTP.
// ==============================================================================

const permissionService = require('../../services/auth/permissionService');
const Role = require('../../models/auth/Role');
const Permission = require('../../models/auth/Permission');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Créer un nouveau rôle
 * @route   POST /api/v1/roles
 * @access  Privé (permission: 'role:create')
 */
exports.createRole = asyncHandler(async (req, res, next) => {
  const { name, description, permissions } = req.body;

  if (!name) {
    return next(new AppError('Veuillez fournir un nom pour le rôle.', 400));
  }

  // Délégation de la logique de création au service
  const newRole = await permissionService.createRole(name, description, permissions);

  res.status(201).json({
    status: 'success',
    data: {
      role: newRole,
    },
  });
});


/**
 * @desc    Récupérer tous les rôles avec leurs permissions
 * @route   GET /api/v1/roles
 * @access  Privé (permission: 'role:read')
 */
exports.getAllRoles = asyncHandler(async (req, res, next) => {
  // Pour une simple lecture, appeler le modèle directement est acceptable.
  // Pour des logiques plus complexes, on passerait par un service.
  const roles = await Role.find().populate('permissions', 'name description group').sort('name');

  res.status(200).json({
    status: 'success',
    results: roles.length,
    data: {
      roles,
    },
  });
});


/**
 * @desc    Récupérer un rôle par son ID
 * @route   GET /api/v1/roles/:id
 * @access  Privé (permission: 'role:read')
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
 * @desc    Mettre à jour un rôle (description et/ou permissions)
 * @route   PATCH /api/v1/roles/:id
 * @access  Privé (permission: 'role:update')
 */
exports.updateRole = asyncHandler(async (req, res, next) => {
  // On ne permet pas de changer le nom du rôle pour des raisons de cohérence système.
  const { description, permissions } = req.body;
  
  const role = await Role.findById(req.params.id);
  if (!role) {
    return next(new AppError('Aucun rôle trouvé avec cet identifiant.', 404));
  }

  if (description !== undefined) {
    role.description = description;
  }
  
  // Si un tableau de permissions est fourni, on le met à jour.
  if (permissions && Array.isArray(permissions)) {
      const foundPermissions = await Permission.find({ name: { $in: permissions } });
      
      if (foundPermissions.length !== permissions.length) {
        return next(new AppError('Une ou plusieurs des permissions spécifiées sont invalides.', 400));
      }

      role.permissions = foundPermissions.map(p => p._id);
      // Invalider le cache car les permissions ont changé.
      await permissionService.invalidateRolePermissionsCache(role._id);
  }

  await role.save({ validateBeforeSave: true });
  
  // Re-populer pour renvoyer le document mis à jour complet.
  const updatedRole = await Role.findById(req.params.id).populate('permissions', 'name description group');

  res.status(200).json({
    status: 'success',
    data: {
      role: updatedRole,
    },
  });
});


/**
 * @desc    Supprimer un rôle
 * @route   DELETE /api/v1/roles/:id
 * @access  Privé (permission: 'role:delete')
 */
exports.deleteRole = asyncHandler(async (req, res, next) => {
  // TODO: Idéalement, la logique de suppression devrait être dans un service
  // qui vérifierait d'abord si le rôle est actuellement utilisé par des utilisateurs.
  
  const role = await Role.findByIdAndDelete(req.params.id);

  if (!role) {
    return next(new AppError('Aucun rôle trouvé avec cet identifiant.', 404));
  }
  
  // Invalider le cache pour ce rôle.
  await permissionService.invalidateRolePermissionsCache(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});