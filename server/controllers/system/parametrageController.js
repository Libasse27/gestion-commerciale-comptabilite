// server/controllers/system/parametrageController.js
// ==============================================================================
//           Contrôleur pour la Gestion des Paramètres du Système
//
// Gère la lecture et la mise à jour des paramètres de l'application.
// Délègue toute la logique au `parametrageService`.
// ==============================================================================

const parametrageService = require('../../services/system/parametrageService');
const Parametrage = require('../../models/system/Parametrage'); // Pour la lecture
const asyncHandler = require('../../utils/asyncHandler');
const AppError = require('../../utils/appError');
const auditLogService = require('../../services/system/auditLogService');

/**
 * @desc    Récupérer tous les paramètres, potentiellement filtrés par groupe
 * @route   GET /api/v1/system/parametres
 * @access  Privé (Admin - permission: 'settings:read')
 */
exports.getAllParametres = asyncHandler(async (req, res, next) => {
  // Pour l'interface d'administration, on veut la liste complète des objets, pas seulement l'objet clé-valeur du cache.
  // On lit donc directement depuis la base.
  
  const filter = {};
  if (req.query.groupe) {
      filter.groupe = req.query.groupe;
  }
  
  const parametres = await Parametrage.find(filter).sort('groupe cle');

  res.status(200).json({
    status: 'success',
    results: parametres.length,
    data: { parametres },
  });
});


/**
 * @desc    Mettre à jour un ou plusieurs paramètres en masse
 * @route   PATCH /api/v1/system/parametres
 * @access  Privé (Admin - permission: 'settings:manage')
 */
exports.updateParametres = asyncHandler(async (req, res, next) => {
    // Le body doit être un tableau d'objets [{ cle, valeur }]
    const updates = req.body; 

    if (!updates || !Array.isArray(updates)) {
        return next(new AppError('Veuillez fournir un tableau de paramètres à mettre à jour.', 400));
    }
    
    // Récupérer les anciennes valeurs pour l'audit
    const cles = updates.map(u => u.cle);
    const parametresBefore = await Parametrage.find({ cle: { $in: cles } }).lean();
    
    // Le service gère la mise à jour et l'invalidation du cache
    const updatedParametres = await parametrageService.updateParametres(updates, req.user.id);
    
    // Loguer l'action d'audit
    auditLogService.logSystemEvent({
        user: req.user.id, action: 'UPDATE', entity: 'Parametres', status: 'SUCCESS',
        ipAddress: req.ip, details: { updates }
    });

    res.status(200).json({
        status: 'success',
        message: `${updates.length} paramètre(s) ont été mis à jour avec succès.`,
        data: {
            parametres: updatedParametres
        }
    });
});