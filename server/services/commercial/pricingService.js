// ==============================================================================
//           Service de Calcul des Prix (Logique Métier)
//
// Ce service centralise toute la logique métier liée au calcul des prix,
// des taxes et des remises.
//
// L'objectif est d'avoir une source unique de vérité pour tous les calculs
// financiers, garantissant la cohérence à travers tous les documents
// commerciaux (devis, factures, etc.).
//
// Il s'appuie sur les utilitaires numériques pour assurer la précision
// des calculs.
// ==============================================================================

const numberUtils = require('../../utils/numberUtils');
const AppError = require('../../utils/appError');

/**
 * Calcule les totaux (HT, TVA, TTC) pour une seule ligne de document.
 * C'est la fonction de base pour tous les calculs de documents.
 *
 * @param {object} params - Les paramètres de la ligne.
 * @param {number} params.quantite - La quantité de l'item.
 * @param {number} params.prixUnitaireHT - Le prix unitaire Hors Taxes.
 * @param {number} [params.remise=0] - Le pourcentage de remise (ex: 10 pour 10%).
 * @param {number} [params.tauxTVA=18] - Le pourcentage de TVA (ex: 18 pour 18%).
 * @returns {{
 *   totalHT: number,
 *   montantTVA: number,
 *   totalTTC: number,
 *   montantRemise: number
 * }} Un objet avec tous les montants calculés pour la ligne.
 */
function calculateLineTotals({ quantite, prixUnitaireHT, remise = 0, tauxTVA = 18 }) {
  const qte = numberUtils.parseNumber(quantite);
  const pu = numberUtils.parseNumber(prixUnitaireHT);
  const rem = numberUtils.parseNumber(remise);
  const tva = numberUtils.parseNumber(tauxTVA);

  if (qte <= 0) throw new AppError('La quantité doit être positive.', 400);

  const baseHT = qte * pu;
  const montantRemise = baseHT * (rem / 100);
  const totalHT = baseHT - montantRemise;
  const montantTVA = totalHT * (tva / 100);
  const totalTTC = totalHT + montantTVA;

  return {
    totalHT: numberUtils.roundTo(totalHT),
    montantTVA: numberUtils.roundTo(montantTVA),
    totalTTC: numberUtils.roundTo(totalTTC),
    montantRemise: numberUtils.roundTo(montantRemise),
  };
}


/**
 * Calcule les totaux globaux (HT, TVA, TTC) pour un document entier
 * à partir de son tableau de lignes.
 *
 * @param {Array<object>} lignes - Le tableau des lignes du document.
 *        Chaque ligne doit avoir `quantite`, `prixUnitaireHT`, `remise`, `tauxTVA`.
 * @returns {{
 *   totalHT: number,
 *   totalTVA: number,
 *   totalTTC: number,
 *   lignesCalculees: Array<object>
 * }} Un objet avec les totaux globaux et le tableau des lignes complété avec leurs totaux.
 */
function calculateDocumentTotals(lignes) {
    if (!lignes || lignes.length === 0) {
        throw new AppError('Le document doit contenir au moins une ligne.', 400);
    }
    
    let totalHTGlobal = 0;
    let totalTVAGlobal = 0;
    let totalTTCGlobal = 0;
    const lignesCalculees = [];

    for (const ligne of lignes) {
        const lineTotals = calculateLineTotals({
            quantite: ligne.quantite,
            prixUnitaireHT: ligne.prixUnitaireHT,
            remise: ligne.remise,
            tauxTVA: ligne.tauxTVA,
        });

        totalHTGlobal += lineTotals.totalHT;
        totalTVAGlobal += lineTotals.montantTVA;
        totalTTCGlobal += lineTotals.totalTTC;
        
        // On enrichit l'objet ligne original avec le total HT calculé
        lignesCalculees.push({
            ...ligne,
            totalHT: lineTotals.totalHT
        });
    }

    return {
        totalHT: numberUtils.roundTo(totalHTGlobal),
        totalTVA: numberUtils.roundTo(totalTVAGlobal),
        totalTTC: numberUtils.roundTo(totalTTCGlobal),
        lignesCalculees,
    };
}


module.exports = {
  calculateLineTotals,
  calculateDocumentTotals,
};