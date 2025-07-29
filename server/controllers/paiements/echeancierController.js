// ==============================================================================
//           Contrôleur pour la Gestion des Échéanciers de Paiement
//
// Ce contrôleur gère les requêtes HTTP pour les opérations CRUD sur les
// échéanciers de paiement associés aux factures.
// ==============================================================================

const Echeancier = require('../../models/paiements/Echeancier');
const Facture = require('../../models/commercial/Facture');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');

/**
 * @desc    Créer un nouvel échéancier pour une facture
 * @route   POST /api/v1/echeanciers
 * @access  Privé (permission: 'manage:paiement')
 */
exports.createEcheancier = asyncHandler(async (req, res, next) => {
  const { factureId, lignes } = req.body;
  
  if (!factureId || !lignes) {
      return next(new AppError('Veuillez fournir un ID de facture et les lignes de l\'échéancier.', 400));
  }
  
  const facture = await Facture.findById(factureId);
  if (!facture) {
      return next(new AppError('Facture non trouvée.', 404));
  }

  // La validation complexe (somme des échéances == total facture) est dans le modèle.
  const nouvelEcheancier = await Echeancier.create({
    facture: factureId,
    client: facture.client,
    lignes: lignes,
    creePar: req.user.id,
  });

  res.status(201).json({
    status: 'success',
    data: {
      echeancier: nouvelEcheancier,
    },
  });
});


/**
 * @desc    Récupérer l'échéancier d'une facture
 * @route   GET /api/v1/echeanciers/facture/:factureId
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getEcheancierByFacture = asyncHandler(async (req, res, next) => {
  const { factureId } = req.params;
  
  const echeancier = await Echeancier.findOne({ facture: factureId })
    .populate('facture', 'numero totalTTC')
    .populate('client', 'nom');
    
  if (!echeancier) {
    return next(new AppError('Aucun échéancier trouvé pour cette facture.', 404));
  }

  res.status(200).json({
    status: 'success',
    data: {
      echeancier,
    },
  });
});


/**
 * @desc    Mettre à jour un échéancier
 * @route   PATCH /api/v1/echeanciers/:id
 * @access  Privé (permission: 'manage:paiement')
 */
exports.updateEcheancier = asyncHandler(async (req, res, next) => {
  const echeancier = await Echeancier.findById(req.params.id);
  if (!echeancier) {
      return next(new AppError('Aucun échéancier trouvé avec cet identifiant.', 404));
  }

  // Règle métier : on ne modifie pas un échéancier qui n'est plus "En cours"
  if (echeancier.statut !== 'En cours') {
      return next(new AppError(`Cet échéancier est ${echeancier.statut} et ne peut plus être modifié.`, 400));
  }
  
  // TODO: La logique de mise à jour devrait être dans un service pour recalculer
  // et re-valider la somme des échéances.
  const updatedEcheancier = await Echeancier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
  });

  res.status(200).json({
    status: 'success',
    data: {
      echeancier: updatedEcheancier,
    },
  });
});


/**
 * @desc    Supprimer (annuler) un échéancier
 * @route   DELETE /api/v1/echeanciers/:id
 * @access  Privé (permission: 'manage:paiement')
 */
exports.deleteEcheancier = asyncHandler(async (req, res, next) => {
    // On privilégie une "annulation" plutôt qu'une suppression physique
    const echeancier = await Echeancier.findByIdAndUpdate(req.params.id, { statut: 'Annulé' });
    
    if (!echeancier) {
        return next(new AppError('Aucun échéancier trouvé avec cet identifiant.', 404));
    }
    
    res.status(204).json({
        status: 'success',
        data: null,
    });
});