// ==============================================================================
//           Contrôleur pour la Comptabilité Générale
//
// Ce contrôleur gère les requêtes HTTP pour les opérations sur le plan comptable
// et les consultations agrégées comme le Grand Livre.
//
// La gestion des écritures comptables est déléguée à `ecritureController.js`.
// ==============================================================================

// --- Import des Modèles et Utils ---
const CompteComptable = require('../../models/comptabilite/CompteComptable');
const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const AppError = require('../../utils/appError');
const asyncHandler = require('../../utils/asyncHandler');


// ===============================================
// --- Section: Plan Comptable (CRUD) ---
// ===============================================

/**
 * @desc    Récupérer tous les comptes du plan comptable
 * @route   GET /api/v1/comptabilite/plan-comptable
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getPlanComptable = asyncHandler(async (req, res, next) => {
  const comptes = await CompteComptable.find({}).sort({ numero: 1 });
  res.status(200).json({
    status: 'success',
    results: comptes.length,
    data: { comptes },
  });
});


/**
 * @desc    Créer un nouveau compte comptable
 * @route   POST /api/v1/comptabilite/plan-comptable
 * @access  Privé (permission: 'manage:comptabilite')
 */
exports.createCompteComptable = asyncHandler(async (req, res, next) => {
  const nouveauCompte = await CompteComptable.create(req.body);
  res.status(201).json({
    status: 'success',
    data: { compte: nouveauCompte },
  });
});


// ===============================================
// --- Section: Consultations (Grand Livre) ---
// ===============================================

/**
 * @desc    Consulter le Grand Livre pour un compte sur une période
 * @route   GET /api/v1/comptabilite/grand-livre/:compteId?dateDebut=...&dateFin=...
 * @access  Privé (permission: 'read:comptabilite')
 */
exports.getGrandLivreCompte = asyncHandler(async (req, res, next) => {
    const { compteId } = req.params;
    const { dateDebut, dateFin } = req.query;

    if (!dateDebut || !dateFin) {
        return next(new AppError('Veuillez fournir une période (dateDebut et dateFin).', 400));
    }
    
    // On cherche toutes les écritures validées de la période qui contiennent une ligne pour ce compte
    const ecritures = await EcritureComptable.find({
        statut: 'Validée',
        date: { $gte: new Date(dateDebut), $lte: new Date(dateFin) },
        'lignes.compte': compteId
    }).populate('journal', 'code').sort({ date: 1 });
    
    // On ne garde que les lignes qui concernent le compte demandé
    const lignesGrandLivre = ecritures.flatMap(e =>
        e.lignes
            .filter(l => l.compte.toString() === compteId)
            .map(l => ({
                date: e.date,
                journal: e.journal.code,
                numeroPiece: e.numeroPiece,
                libelle: l.libelle,
                debit: l.debit,
                credit: l.credit,
            }))
    );
    
    // TODO: Calculer le solde de départ pour avoir un solde progressif
    
    res.status(200).json({
        status: 'success',
        data: {
            lignes: lignesGrandLivre,
        }
    });
});