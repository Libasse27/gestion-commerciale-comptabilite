// server/services/commercial/pricingService.js
const { roundTo, ensureNumber } = require('../../utils/numberUtils');
const AppError = require('../../utils/appError');

function calculateLineTotals(ligne) {
  const qte = ensureNumber(ligne.quantite);
  const pu = ensureNumber(ligne.prixUnitaireHT);
  const tauxRemise = ensureNumber(ligne.tauxRemise, 0);
  const tauxTVA = ensureNumber(ligne.tauxTVA, 18);

  if (qte <= 0) throw new AppError('La quantité doit être un nombre positif.', 400);
  if (pu < 0) throw new AppError('Le prix unitaire ne peut être négatif.', 400);

  const baseHT = qte * pu;
  const montantRemise = baseHT * (tauxRemise / 100);
  const totalHT = baseHT - montantRemise;
  const montantTVA = totalHT * (tauxTVA / 100);
  const totalTTC = totalHT + montantTVA;

  return {
    totalHT: roundTo(totalHT),
    montantTVA: roundTo(montantTVA),
    totalTTC: roundTo(totalTTC),
    montantRemise: roundTo(montantRemise),
  };
}

function calculateDocumentTotals(lignes) {
    if (!lignes || lignes.length === 0) {
        throw new AppError('Le document doit contenir au moins une ligne pour le calcul.', 400);
    }
    
    let totalHTGlobal = 0;
    let totalTVAGlobal = 0;
    
    const lignesCalculees = lignes.map(ligne => {
        const lineTotals = calculateLineTotals(ligne);
        totalHTGlobal += lineTotals.totalHT;
        totalTVAGlobal += lineTotals.montantTVA;
        
        return {
            ...ligne,
            totalHT: lineTotals.totalHT,
            totalTTC: lineTotals.totalTTC,
        };
    });

    const totalTTCGlobal = roundTo(totalHTGlobal + totalTVAGlobal);

    return {
        totalHT: roundTo(totalHTGlobal),
        totalTVA: roundTo(totalTVAGlobal),
        totalTTC: totalTTCGlobal,
        lignesCalculees,
    };
}

module.exports = {
  calculateLineTotals,
  calculateDocumentTotals,
};