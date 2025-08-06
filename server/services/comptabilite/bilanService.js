// server/services/comptabilite/bilanService.js
const balanceService = require('./balanceService');
const ExerciceComptable = require('../../models/comptabilite/ExerciceComptable');
const AppError = require('../../utils/appError');
const { roundTo } = require('../../utils/numberUtils');

async function genererBilan(dateFin) {
  const dateCloture = new Date(dateFin);

  const exercice = await ExerciceComptable.findOne({
    dateDebut: { $lte: dateCloture },
    dateFin: { $gte: dateCloture },
  }).lean();
  if (!exercice) {
    throw new AppError(`Aucun exercice comptable trouvé pour la date ${dateCloture.toLocaleDateString()}.`, 400);
  }

  // Obtenir la balance de tous les comptes jusqu'à la date de fin
  const balanceGlobale = await balanceService.genererBalanceGenerale({
      dateDebut: new Date('1900-01-01'), // Date de départ "théorique"
      dateFin: dateCloture
  });

  const { lignes } = balanceGlobale;

  // Calculer le résultat de la période (Produits - Charges)
  const resultatExercice = lignes.reduce((acc, compte) => {
    const classe = parseInt(String(compte.numero).charAt(0));
    if (classe === 7) { // Produits
      acc += (compte.soldeCreditFinal - compte.soldeDebitFinal);
    } else if (classe === 6) { // Charges
      acc -= (compte.soldeDebitFinal - compte.soldeCreditFinal);
    }
    return acc;
  }, 0);

  // Structurer l'Actif et le Passif
  const actif = { total: 0, postes: {} };
  const passif = { total: 0, postes: {} };

  lignes.forEach(compte => {
    const classe = parseInt(String(compte.numero).charAt(0));
    if (classe >= 1 && classe <= 5) {
      const soldeFinal = compte.soldeDebitFinal - compte.soldeCreditFinal;
      if (soldeFinal > 0) { // Solde débiteur -> Actif
        actif.postes[compte.numero] = { libelle: compte.libelle, montant: soldeFinal };
        actif.total += soldeFinal;
      } else if (soldeFinal < 0) { // Solde créditeur -> Passif
        passif.postes[compte.numero] = { libelle: compte.libelle, montant: Math.abs(soldeFinal) };
        passif.total += Math.abs(soldeFinal);
      }
    }
  });

  // Ajouter le résultat de l'exercice au passif (si bénéfice) ou à l'actif (si perte)
  if (resultatExercice >= 0) {
    passif.postes['120'] = { libelle: 'Résultat de l\'exercice (Bénéfice)', montant: resultatExercice };
    passif.total += resultatExercice;
  } else {
    actif.postes['129'] = { libelle: 'Résultat de l\'exercice (Perte)', montant: Math.abs(resultatExercice) };
    actif.total += Math.abs(resultatExercice);
  }
  
  actif.total = roundTo(actif.total);
  passif.total = roundTo(passif.total);

  return {
    dateCloture,
    exerciceAnnee: exercice.annee,
    actif,
    passif,
    resultatExercice: roundTo(resultatExercice),
    equilibre: Math.abs(actif.total - passif.total) < 0.01,
  };
}

module.exports = {
  genererBilan,
};