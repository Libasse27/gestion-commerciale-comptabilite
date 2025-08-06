// ==============================================================================
//           Service pour l'Analyse et les Rapports Comptables
//
// Ce service est purement analytique. Il utilise des pipelines d'agrégation
// MongoDB pour transformer les écritures comptables brutes en états financiers
// structurés (Balance, Grand Livre, etc.).
// ==============================================================================

const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const CompteComptable = require('../../models/comptabilite/CompteComptable');
const ExerciceComptable = require('../../models/comptabilite/ExerciceComptable');
const AppError = require('../../utils/appError');
const mongoose = require('mongoose');

/**
 * Génère la Balance Comptable pour un exercice donné.
 * La balance liste tous les comptes mouvementés sur la période avec leurs totaux
 * de débits, crédits et leur solde final.
 *
 * @param {string} exerciceId - L'ID de l'exercice comptable.
 * @returns {Promise<object>} Un objet contenant les lignes de la balance et les totaux.
 */
async function genererBalanceComptable(exerciceId) {
  if (!exerciceId) throw new AppError('Un exercice comptable doit être spécifié.', 400);

  const exercice = await ExerciceComptable.findById(exerciceId);
  if (!exercice) throw new AppError('Exercice comptable non trouvé.', 404);

  const balance = await EcritureComptable.aggregate([
    // 1. Filtrer les écritures de l'exercice concerné
    { $match: { exercice: new mongoose.Types.ObjectId(exerciceId) } },
    
    // 2. "Dénormaliser" le tableau de lignes pour traiter chaque mouvement individuellement
    { $unwind: '$lignes' },
    
    // 3. Grouper par compte comptable et sommer les débits et crédits
    {
      $group: {
        _id: '$lignes.compte',
        totalDebit: { $sum: '$lignes.debit' },
        totalCredit: { $sum: '$lignes.credit' },
      }
    },

    // 4. Joindre les informations du compte (numéro, libellé, sens)
    {
      $lookup: {
        from: 'comptabilite_plan', // Nom de la collection des comptes
        localField: '_id',
        foreignField: '_id',
        as: 'compteInfo'
      }
    },
    { $unwind: '$compteInfo' }, // Dénormaliser le résultat du lookup

    // 5. Calculer le solde final pour chaque compte
    {
      $project: {
        _id: 0,
        compteId: '$_id',
        numero: '$compteInfo.numero',
        libelle: '$compteInfo.libelle',
        sens: '$compteInfo.sens',
        totalDebit: { $round: ['$totalDebit', 2] },
        totalCredit: { $round: ['$totalCredit', 2] },
        soldeDebit: {
          $cond: {
            if: { $gt: ['$totalDebit', '$totalCredit'] },
            then: { $round: [{ $subtract: ['$totalDebit', '$totalCredit'] }, 2] },
            else: 0
          }
        },
        soldeCredit: {
          $cond: {
            if: { $gt: ['$totalCredit', '$totalDebit'] },
            then: { $round: [{ $subtract: ['$totalCredit', '$totalDebit'] }, 2] },
            else: 0
          }
        }
      }
    },
    
    // 6. Trier par numéro de compte
    { $sort: { numero: 1 } }
  ]);
  
  // Calculer les totaux généraux de la balance
  const totaux = balance.reduce((acc, ligne) => {
      acc.totalDebit += ligne.totalDebit;
      acc.totalCredit += ligne.totalCredit;
      return acc;
  }, { totalDebit: 0, totalCredit: 0 });

  if (Math.abs(totaux.totalDebit - totaux.totalCredit) > 0.01) {
      logger.warn(`La balance pour l'exercice ${exercice.annee} est déséquilibrée.`);
  }

  return {
    exercice: { annee: exercice.annee, statut: exercice.statut },
    lignes: balance,
    totaux: {
        totalDebit: totaux.totalDebit,
        totalCredit: totaux.totalCredit
    }
  };
}


/**
 * Génère le Grand Livre pour un compte comptable sur une période donnée.
 * Le grand livre est le détail de toutes les écritures qui ont affecté un compte.
 *
 * @param {string} compteId - L'ID du compte comptable.
 * @param {string} exerciceId - L'ID de l'exercice comptable.
 * @returns {Promise<object>}
 */
async function genererGrandLivre(compteId, exerciceId) {
    if (!compteId || !exerciceId) throw new AppError('Un compte et un exercice sont requis.', 400);

    const exercice = await ExerciceComptable.findById(exerciceId).lean();
    const compte = await CompteComptable.findById(compteId).lean();
    if (!exercice || !compte) throw new AppError('Exercice ou Compte non trouvé.', 404);

    // 1. Calculer le solde initial (solde à la date de début de l'exercice)
    const soldeInitialData = await EcritureComptable.aggregate([
        { $match: { date: { $lt: exercice.dateDebut } } },
        { $unwind: '$lignes' },
        { $match: { 'lignes.compte': new mongoose.Types.ObjectId(compteId) } },
        { $group: {
            _id: null,
            totalDebit: { $sum: '$lignes.debit' },
            totalCredit: { $sum: '$lignes.credit' }
        }}
    ]);
    const soldeInitial = (soldeInitialData[0]?.totalDebit || 0) - (soldeInitialData[0]?.totalCredit || 0);

    // 2. Récupérer tous les mouvements de la période
    const mouvements = await EcritureComptable.aggregate([
        { $match: { exercice: new mongoose.Types.ObjectId(exerciceId) } },
        { $unwind: '$lignes' },
        { $match: { 'lignes.compte': new mongoose.Types.ObjectId(compteId) } },
        { $sort: { date: 1 } },
        { $project: {
            _id: 1, date: 1, libelle: 1, numeroPiece: 1,
            debit: '$lignes.debit', credit: '$lignes.credit'
        }}
    ]);

    // 3. Calculer le solde courant après chaque mouvement et le solde final
    let soldeCourant = soldeInitial;
    const mouvementsAvecSolde = mouvements.map(m => {
        soldeCourant += (m.debit || 0) - (m.credit || 0);
        return { ...m, solde: soldeCourant };
    });

    return {
        compte: { numero: compte.numero, libelle: compte.libelle },
        exercice: { annee: exercice.annee },
        soldeInitial,
        mouvements: mouvementsAvecSolde,
        soldeFinal: soldeCourant
    };
}


module.exports = {
  genererBalanceComptable,
  genererGrandLivre,
};