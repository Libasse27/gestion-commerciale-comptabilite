// ==============================================================================
//           Contrôleur pour la Gestion des Utilisateurs (CRUD)
//
// Ce contrôleur gère les requêtes HTTP pour les opérations CRUD sur les
// entités Utilisateur. Ces actions sont généralement réservées aux
// administrateurs, à l'exception des routes '/me' pour le profil personnel.
//
// Il s'appuie sur le modèle User et pourrait, pour des logiques plus
// complexes, s'appuyer sur un `userService` dédié.
// ==============================================================================

const User = require('../../models/auth/User');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');
const { capitalizeFirstLetter } = require('../../utils/helpers');

/**
 * Filtre un objet pour ne garder que les champs autorisés.
 * Empêche un utilisateur de mettre à jour des champs sensibles comme son rôle.
 */
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


/**
 * @desc    Récupérer tous les utilisateurs
 * @route   GET /api/v1/users
 * @access  Privé (permission: 'user:read:all')
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().populate('role', 'name').sort('lastName firstName');

  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users,
    },
  });
});


/**
 * @desc    Récupérer un utilisateur par son ID
 * @route   GET /api/v1/users/:id
 * @access  Privé (permission: 'user:read')
 */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('role', 'name');

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});


/**
 * @desc    Créer un nouvel utilisateur (par un admin)
 * @route   POST /api/v1/users
 * @access  Privé (permission: 'user:create')
 */
exports.createUser = asyncHandler(async (req, res, next) => {
    // Cette fonction est destinée à un admin. Elle pourrait permettre de définir le rôle,
    // le statut actif, et d'envoyer un email d'invitation avec un mot de passe temporaire.
    // Pour l'instant, elle se base sur le corps de la requête.
    const newUser = await User.create(req.body);
    newUser.password = undefined; // Ne jamais renvoyer le mot de passe

    res.status(201).json({
        status: 'success',
        data: {
            user: newUser,
        }
    });
});


/**
 * @desc    Mettre à jour un utilisateur (par un admin)
 * @route   PATCH /api/v1/users/:id
 * @access  Privé (permission: 'user:update')
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  // L'admin ne doit pas pouvoir mettre à jour le mot de passe via cette route.
  if (req.body.password || req.body.passwordConfirm) {
    return next(new AppError('Cette route ne permet pas de modifier les mots de passe.', 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('role', 'name');

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet identifiant.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});


/**
 * @desc    Supprimer un utilisateur (soft delete)
 * @route   DELETE /api/v1/users/:id
 * @access  Privé (permission: 'user:delete')
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  // Au lieu de supprimer, il est souvent préférable de désactiver le compte (soft delete)
  // pour préserver l'historique et l'intégrité des données (ex: factures créées par cet utilisateur).
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false });

  if (!user) {
    return next(new AppError('Aucun utilisateur trouvé avec cet identifiant.', 404));
  }

  res.status(204).json({
    status: 'success',
    data: null,
  });
});


/**
 * @desc    Récupérer les informations de l'utilisateur actuellement connecté
 * @route   GET /api/v1/users/me
 * @access  Privé (tous les utilisateurs connectés)
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    // Le middleware `protect` a déjà mis `req.user`.
    // On peut simplement le renvoyer. Le `populate` a déjà été fait dans `protect`.
    res.status(200).json({
        status: 'success',
        data: {
            user: req.user,
        }
    });
});


/**
 * @desc    Mettre à jour les informations de l'utilisateur actuellement connecté
 * @route   PATCH /api/v1/users/updateMe
 * @access  Privé (tous les utilisateurs connectés)
 */
exports.updateMe = asyncHandler(async (req, res, next) => {
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError("Cette route n'est pas pour la mise à jour du mot de passe. Veuillez utiliser /auth/updateMyPassword.", 400)
        );
    }
    
    // Filtrer les champs que l'utilisateur a le droit de modifier lui-même.
    const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email');
    if (filteredBody.firstName) filteredBody.firstName = capitalizeFirstLetter(filteredBody.firstName);
    if (filteredBody.lastName) filteredBody.lastName = filteredBody.lastName.toUpperCase();
    
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    }).populate('role', 'name');
    
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});