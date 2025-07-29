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
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Créer un nouveau rôle
 * @route   POST /api/v1/roles
 * @access  Privé/Admin
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
 * @desc    Récupérer tous les rôles
 * @route   GET /api/v1/roles
 * @access  Privé/Admin
 */
exports.getAllRoles = asyncHandler(async (req, res, next) => {
  // Pour une simple lecture, on peut appeler le modèle directement,
  // mais idéalement, cela passerait aussi par un service.
  const roles = await Role.find().populate('permissions', 'name description');

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
 * @access  Privé/Admin
 */
exports.getRoleById = asyncHandler(async (req, res, next) => {
  const role = await Role.findById(req.params.id).populate('permissions', 'name description');

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
 * @access  Privé/Admin
 */
exports.updateRole = asyncHandler(async (req, res, next) => {
  // On ne permet pas de changer le nom du rôle pour des raisons de cohérence.
  const { description, permissions } = req.body;
  
  // TODO: Idéalement, créer une fonction `updateRole` dans le permissionService
  // pour encapsuler cette logique.
  
  const role = await Role.findById(req.params.id);
  if (!role) {
    return next(new AppError('Aucun rôle trouvé avec cet identifiant.', 404));
  }

  if (description !== undefined) {
    role.description = description;
  }
  
  if (permissions && Array.isArray(permissions)) {
      // Logique pour mettre à jour les permissions (à placer dans le service)
      const foundPermissions = await permissionService.Permission.find({ name: { $in: permissions } });
      role.permissions = foundPermissions.map(p => p._id);
      await permissionService.invalidateRolePermissionsCache(role._id);
  }

  await role.save();
  
  const updatedRole = await Role.findById(req.params.id).populate('permissions', 'name description');

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
 * @access  Privé/Admin
 */
exports.deleteRole = asyncHandler(async (req, res, next) => {
  // TODO: La logique métier de suppression (vérifier si le rôle est utilisé)
  // devrait être dans le `permissionService`.
  const role = await Role.findByIdAndDelete(req.params.id);

  if (!role) {
    return next(new AppError('Aucun rôle trouvé avec cet identifiant.', 404));
  }
  
  // Invalider le cache pour ce rôle
  await permissionService.invalidateRolePermissionsCache(req.params.id);

  res.status(204).json({
    status: 'success',
    data: null,
  });
});