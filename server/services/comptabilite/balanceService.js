// ==============================================================================
//           Service pour le Calcul des Balances Comptables
//
// Ce service contient la logique métier pour générer des balances comptables
// (générale, tiers) sur une période donnée.
//
// Il utilise le "Aggregation Framework" de MongoDB pour agréger les données
// des écritures comptables de manière performante.
// ==============================================================================

const EcritureComptable = require('../../models/comptabilite/EcritureComptable');
const CompteComptable = require('../../models/comptabilite/CompteComptable');
const AppError = require('../../utils/appError');

/**
 * Génère la balance comptable générale pour une période donnée.
 *
 * @param {object} params - Paramètres de la balance.
 * @param {Date} params.dateDebut - Date de début de la période.
 * @param {Date} params.dateFin - Date de fin de la période.
 * @param {boolean} [params.inclureComptesNonMouvementes=true] - Inclure les comptes sans mouvement.
 * @returns {Promise<Array<object>>} Un tableau d'objets représentant les lignes de la balance.
 */
async function genererBalanceGenerale({ dateDebut, dateFin, inclureComptesNonMouvementes = true }) {
  if (!dateDebut || !dateFin) {
    throw new AppError('Veuillez fournir une date de début et une date de fin.', 400);
  }

  // --- Étape 1: Agréger les mouvements de la période ---
  const mouvements = await EcritureComptable.aggregate([
    // 1a. Filtrer les écritures validées dans la période
    {
      $match: {
        statut: 'Validée',
        date: { $gte: new Date(dateDebut), $lte: new Date(dateFin) }
      }
    },
    // 1b. "Dénormaliser" le tableau de lignes pour avoir un document par ligne d'écriture
    { $unwind: '$lignes' },
    // 1c. Grouper par compte et sommer les débits et crédits
    {
      $group: {
        _id: '$lignes.compte',
        totalDebit: { $sum: '$lignes.debit' },
        totalCredit: { $sum: '$lignes.credit' }
      }
    }
  ]);

  // --- Étape 2: Récupérer tous les comptes du plan comptable ---
  const tousLesComptes = await CompteComptable.find({}).lean();
  const balanceMap = new Map();

  // Initialiser la map avec tous les comptes
  tousLesComptes.forEach(compte => {
    balanceMap.set(compte._id.toString(), {
      numero: compte.numero,
      libelle: compte.libelle,
      totalDebit: 0,
      totalCredit: 0,
    });
  });

  // Mettre à jour la map avec les mouvements calculés
  mouvements.forEach(mvt => {
    const compteId = mvt._id.toString();
    if (balanceMap.has(compteId)) {
      const compteData = balanceMap.get(compteId);
      compteData.totalDebit = mvt.totalDebit;
      compteData.totalCredit = mvt.totalCredit;
    }
  });

  // --- Étape 3: Calculer les soldes et formater le résultat ---
  let balanceResult = Array.from(balanceMap.values()).map(compte => {
    const solde = compte.totalDebit - compte.totalCredit;
    return {
      ...compte,
      soldeDebiteur: solde > 0 ? solde : 0,
      soldeCrediteur: solde < 0 ? Math.abs(solde) : 0,
    };
  });
  
  // Filtrer les comptes non mouvementés si demandé
  if (!inclureComptesNonMouvementes) {
      balanceResult = balanceResult.filter(
          compte => compte.totalDebit !== 0 || compte.totalCredit !== 0
      );
  }

  // Trier par numéro de compte
  return balanceResult.sort((a, b) => a.numero.localeCompare(b.numero));
}


module.exports = {
  genererBalanceGenerale,
};