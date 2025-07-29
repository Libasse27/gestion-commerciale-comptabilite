// ==============================================================================
//           Contrôleur pour la Gestion des Utilisateurs (CRUD)
//
// Ce contrôleur gère les requêtes HTTP pour les opérations CRUD sur les
// entités Utilisateur. Ces actions sont généralement réservées aux
// administrateurs.
//
// Il s'appuie sur le modèle User et pourrait, pour des logiques plus
// complexes, s'appuyer sur un `userService` dédié.
// ==============================================================================

const User = require('../../models/auth/User');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

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
 * @access  Privé/Admin
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find().populate('role', 'name');

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
 * @access  Privé/Admin
 */
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).populate('role');

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
 * @access  Privé/Admin
 */
exports.createUser = asyncHandler(async (req, res, next) => {
    // Cette fonction est similaire à `register` mais est destinée à un admin.
    // Elle pourrait permettre de définir le rôle directement.
    const newUser = await User.create(req.body);

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
 * @access  Privé/Admin
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
  // Un admin peut potentiellement tout mettre à jour : rôle, statut, etc.
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true, // Retourne le document mis à jour
    runValidators: true, // Applique les validateurs du schéma
  });

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
 * @desc    Supprimer un utilisateur
 * @route   DELETE /api/v1/users/:id
 * @access  Privé/Admin
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);

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
    // On peut donc simplement renvoyer ces informations.
    const user = await User.findById(req.user.id).populate('role');

    res.status(200).json({
        status: 'success',
        data: {
            user,
        }
    });
});


/**
 * @desc    Mettre à jour les informations de l'utilisateur actuellement connecté
 * @route   PATCH /api/v1/users/updateMe
 * @access  Privé (tous les utilisateurs connectés)
 */
exports.updateMe = asyncHandler(async (req, res, next) => {
    // 1) Créer une erreur si l'utilisateur essaie de mettre à jour son mot de passe ici
    if (req.body.password || req.body.passwordConfirm) {
        return next(
            new AppError(
                'Cette route n\'est pas pour la mise à jour du mot de passe. Veuillez utiliser /updateMyPassword.',
                400
            )
        );
    }
    
    // 2) Filtrer les champs non désirés qui ne doivent pas être mis à jour
    const filteredBody = filterObj(req.body, 'firstName', 'lastName', 'email');
    
    // 3) Mettre à jour le document utilisateur
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,
        runValidators: true,
    });
    
    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
});