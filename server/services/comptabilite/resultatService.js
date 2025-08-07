// server/services/comptabilite/resultatService.js
const balanceService = require('./balanceService');
const { roundTo } = require('../../utils/numberUtils');

/**
 * Génère le compte de résultat pour une période donnée.
 * @param {{dateDebut: Date, dateFin: Date}} periode
 * @returns {Promise<object>}
 */
async function genererCompteDeResultat({ dateDebut, dateFin }) {
  // S'appuie sur la balance pour obtenir les soldes des comptes
  const balance = await balanceService.genererBalanceGenerale({ dateDebut, dateFin });
  
  const produits = { total: 0, postes: {} };
  const charges = { total: 0, postes: {} };

  balance.lignes.forEach(compte => {
    const classe = parseInt(String(compte.numero).charAt(0));
    // Pour le compte de résultat, on ne s'intéresse qu'aux mouvements de la période
    const soldeMouvement = compte.creditMouvement - compte.debitMouvement;

    if (classe === 7 && soldeMouvement > 0) { // Produits
      produits.postes[compte.numero] = { libelle: compte.libelle, montant: soldeMouvement };
      produits.total += soldeMouvement;
    } else if (classe === 6) { // Charges
        const chargeMouvement = compte.debitMouvement - compte.creditMouvement;
        if (chargeMouvement > 0) {
            charges.postes[compte.numero] = { libelle: compte.libelle, montant: chargeMouvement };
            charges.total += chargeMouvement;
        }
    }
  });

  const resultatNet = produits.total - charges.total;

  return {
    periode: { dateDebut, dateFin },
    produits,
    charges,
    resultatNet: roundTo(resultatNet),
  };
}

module.exports = { genererCompteDeResultat };