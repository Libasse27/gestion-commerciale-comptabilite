// ==============================================================================
//           Service pour la Génération du Bilan Comptable
//
// Ce service contient la logique métier pour construire un bilan financier à
// une date donnée.
//
// Il s'appuie sur le `balanceService` pour obtenir les soldes de tous les
// comptes, puis il les agrège et les structure en Actif et Passif.
// ==============================================================================

const balanceService = require('./balanceService');
const ExerciceComptable = require('../../models/comptabilite/ExerciceComptable');
const AppError = require('../../utils/appError');
const numberUtils = require('../../utils/numberUtils');

/**
 * Calcule le résultat de l'exercice (Produits - Charges) sur une période.
 * @private
 */
const _calculerResultatExercice = async (dateDebut, dateFin) => {
  const balance = await balanceService.genererBalanceGenerale({ dateDebut, dateFin, inclureComptesNonMouvementes: false });

  let totalProduits = 0; // Classe 7
  let totalCharges = 0;  // Classe 6

  for (const compte of balance) {
    // Les comptes de produits ont un solde créditeur
    if (compte.numero.startsWith('7')) {
      totalProduits += compte.soldeCrediteur;
    }
    // Les comptes de charges ont un solde débiteur
    else if (compte.numero.startsWith('6')) {
      totalCharges += compte.soldeDebiteur;
    }
  }

  return numberUtils.roundTo(totalProduits - totalCharges);
};


/**
 * Génère le bilan comptable à une date de fin donnée.
 * @param {Date} dateFin - La date à laquelle le bilan doit être établi.
 * @returns {Promise<object>} Un objet structuré représentant le bilan.
 */
async function genererBilan(dateFin) {
  const dateCloture = new Date(dateFin);

  // 1. Trouver l'exercice comptable correspondant
  const exercice = await ExerciceComptable.findOne({
    dateDebut: { $lte: dateCloture },
    dateFin: { $gte: dateCloture },
  });

  if (!exercice) {
    throw new AppError(`Aucun exercice comptable trouvé pour la date ${dateCloture.toLocaleDateString()}.`, 400);
  }

  // 2. Calculer le résultat de l'exercice
  const resultatExercice = await _calculerResultatExercice(exercice.dateDebut, dateCloture);
  
  // 3. Générer la balance générale de tous les comptes depuis le début de l'exercice
  const balance = await balanceService.genererBalanceGenerale({ dateDebut: exercice.dateDebut, dateFin: dateCloture });

  // 4. Structurer l'Actif et le Passif
  const actif = { total: 0, postes: [] };
  const passif = { total: 0, postes: [] };

  for (const compte of balance) {
    const classe = parseInt(compte.numero.charAt(0));
    const soldeDebiteur = compte.soldeDebiteur;
    const soldeCrediteur = compte.soldeCrediteur;
    
    // On ne traite que les comptes de bilan (Classe 1 à 5)
    if (classe >= 1 && classe <= 5) {
        // Logique simplifiée de classification
        // Une vraie classification SYSCOHADA est beaucoup plus détaillée
        if (soldeDebiteur > 0) { // C'est un poste d'Actif
            actif.postes.push({ numero: compte.numero, libelle: compte.libelle, montant: soldeDebiteur });
            actif.total += soldeDebiteur;
        } else if (soldeCrediteur > 0) { // C'est un poste de Passif
            passif.postes.push({ numero: compte.numero, libelle: compte.libelle, montant: soldeCrediteur });
            passif.total += soldeCrediteur;
        }
    }
  }

  // 5. Ajouter le résultat de l'exercice au passif
  // Compte 131 - Résultat net : Bénéfice (créditeur) ou 139 - Perte (débiteur)
  if (resultatExercice >= 0) {
      passif.postes.push({ numero: '131', libelle: 'Résultat de l\'exercice (Bénéfice)', montant: resultatExercice });
      passif.total += resultatExercice;
  } else {
      // Une perte vient en déduction du passif, mais on la met à l'actif pour équilibrer
      // La présentation comptable est complexe. Pour simplifier, on l'ajoute au passif en négatif conceptuellement.
      actif.postes.push({ numero: '139', libelle: 'Résultat de l\'exercice (Perte)', montant: Math.abs(resultatExercice) });
      actif.total += Math.abs(resultatExercice);
  }
  
  // Arrondir les totaux finaux
  actif.total = numberUtils.roundTo(actif.total);
  passif.total = numberUtils.roundTo(passif.total);

  return {
    dateCloture,
    exerciceAnnee: exercice.annee,
    actif,
    passif,
    resultatExercice,
    equilibre: Math.abs(actif.total - passif.total) < 0.01 // Vérifier l'équilibre
  };
}


module.exports = {
  genererBilan,
};