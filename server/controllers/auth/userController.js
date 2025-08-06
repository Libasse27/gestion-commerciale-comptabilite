// server/controllers/auth/userController.js
// ==============================================================================
//           Contrôleur pour la Gestion des Utilisateurs (CRUD)
//
// Gère les requêtes HTTP pour les opérations CRUD sur les entités Utilisateur.
// ==============================================================================

const User = require('../../models/auth/User');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const { capitalizeFirstLetter } = require('../../utils/helpers');
const APIFeatures = require('../../utils/apiFeatures');
const auditLogService = require('../../services/system/auditLogService');

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

/** @desc Récupérer tous les utilisateurs */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const features = new APIFeatures(User.find().populate('role', 'name'), req.query)
    .filter()
    .search(['firstName', 'lastName', 'email'])
    .sort()
    .paginate();
  
  const users = await features.query;

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: { users },
  });
});

/** @desc Récupérer un utilisateur par son ID */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('role', 'name');
  if (!user) return next(new AppError('Aucun utilisateur trouvé avec cet identifiant.', 404));
  res.status(200).json({ status: 'success', data: { user } });
});

/** @desc Créer un nouvel utilisateur (par un admin) */
exports.createUser = asyncHandler(async (req, res, next) => {
    const newUser = await User.create(req.body);
    newUser.password = undefined;

    auditLogService.logCreate({
        user: req.user.id, entity: 'User', entityId: newUser._id, ipAddress: req.ip
    });

    res.status(201).json({ status: 'success', data: { user: newUser } });
});

/** @desc Mettre à jour un utilisateur (par un admin) */
exports.updateUser = asyncHandler(async (req, res, next) => {
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Cette route ne permet pas de modifier les mots de passe.', 400));
  }
  
  const userBefore = await User.findById(req.params.id).lean();
  if (!userBefore) return next(new AppError('Aucun utilisateur trouvé avec cet identifiant.', 404));

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  }).populate('role', 'name');

  auditLogService.logUpdate(
    { user: req.user.id, entity: 'User', entityId: user._id, ipAddress: req.ip },
    userBefore, user.toObject()
  );

  res.status(200).json({ status: 'success', data: { user } });
});

/** @desc Désactiver un utilisateur (soft delete) */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const userToDeactivate = await User.findById(req.params.id);
  if (!userToDeactivate) return next(new AppError('Aucun utilisateur trouvé avec cet identifiant.', 404));

  // Empêcher un admin de se désactiver lui-même
  if (userToDeactivate._id.equals(req.user.id)) {
      return next(new AppError('Vous ne pouvez pas désactiver votre propre compte.', 400));
  }

  userToDeactivate.isActive = false;
  await userToDeactivate.save({ validateBeforeSave: false });

  auditLogService.logUpdate(
    { user: req.user.id, entity: 'User', entityId: userToDeactivate._id, ipAddress: req.ip },
    { isActive: true }, { isActive: false }
  );

  res.status(204).json({ status: 'success', data: null });
});

/** @desc Récupérer les infos de l'utilisateur connecté */
exports.getMe = (req, res, next) => {
    // Le middleware `protect` a déjà mis l'utilisateur dans `req.user`
    res.status(200).json({ status: 'success', data: { user: req.user } });
};

/** @desc Mettre à jour les infos de l'utilisateur connecté */
exports.updateMe = asyncHandler(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(new AppError("Cette route n'est pas pour la mise à jour du mot de passe. Veuillez utiliser /api/v1/auth/updateMyPassword.", 400));
    }
    
    const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email');
    if (filteredBody.firstName) filteredBody.firstName = capitalizeFirstLetter(filteredBody.firstName);
    if (filteredBody.lastName) filteredBody.lastName = filteredBody.lastName.toUpperCase();
    
    const userBefore = await User.findById(req.user.id).lean();

    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true, runValidators: true,
    }).populate('role', 'name');

    auditLogService.logUpdate(
        { user: req.user.id, entity: 'User', entityId: updatedUser._id, ipAddress: req.ip },
        userBefore, updatedUser.toObject()
    );
    
    res.status(200).json({ status: 'success', data: { user: updatedUser } });
});