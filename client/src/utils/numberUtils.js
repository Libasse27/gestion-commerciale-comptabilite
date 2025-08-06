// client/src/utils/numberUtils.js
// ==============================================================================
//                  Utilitaire de Manipulation des Nombres (Client)
// ==============================================================================

/**
 * Arrondit un nombre à un nombre spécifié de décimales.
 * @param {number | string} num - Le nombre à arrondir.
 * @param {number} [decimals=2] - Le nombre de décimales.
 * @returns {number} Le nombre arrondi.
 */
export const roundTo = (num, decimals = 2) => {
  const value = Number(num);
  if (isNaN(value)) return 0;

  const shifter = Math.pow(10, decimals);
  return Math.round((value + Number.EPSILON) * shifter) / shifter;
};

/**
 * S'assure qu'une valeur est un nombre valide, sinon retourne une valeur par défaut.
 * @param {*} value - La valeur à parser.
 * @param {number} [defaultValue=0] - La valeur à retourner si l'entrée est invalide.
 * @returns {number}
 */
export const ensureNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(String(value).replace(',', '.'));
  return isNaN(num) ? defaultValue : num;
};

/**
 * Calcule le total d'une ligne de document (devis, facture) côté client.
 * @param {object} line
 * @returns {{totalHT: number, totalTTC: number, montantTVA: number, montantRemise: number}}
 */
export const calculateLineTotals = ({ quantite, prixUnitaire, remise = 0, tva = 18 }) => {
  const qte = ensureNumber(quantite, 1);
  const pu = ensureNumber(prixUnitaire);
  const rem = ensureNumber(remise);
  const tvaRate = ensureNumber(tva);

  const baseHT = qte * pu;
  const montantRemise = baseHT * (rem / 100);
  const totalHT = baseHT - montantRemise;
  const montantTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + montantTVA;

  return {
    totalHT: roundTo(totalHT, 2),
    totalTTC: roundTo(totalTTC, 2),
    montantRemise: roundTo(montantRemise, 2),
    montantTVA: roundTo(montantTVA, 2),
  };
};

/**
 * Calcule les totaux globaux à partir d'un tableau de lignes.
 * @param {Array<object>} lines - Le tableau des lignes.
 * @returns {{totalHT: number, totalTTC: number, totalTVA: number, totalRemise: number}}
 */
export const calculateGrandTotals = (lines) => {
    if (!Array.isArray(lines)) {
        return { totalHT: 0, totalTTC: 0, totalTVA: 0, totalRemise: 0 };
    }

    const totals = lines.reduce((acc, line) => {
        const lineTotals = calculateLineTotals(line);
        acc.totalHT += lineTotals.totalHT;
        acc.totalTTC += lineTotals.totalTTC;
        acc.totalRemise += lineTotals.montantRemise;
        return acc;
    }, { totalHT: 0, totalTTC: 0, totalRemise: 0 });

    const grandTotalHT = roundTo(totals.totalHT, 2);
    const grandTotalTTC = roundTo(totals.totalTTC, 2);
    const grandTotalTVA = roundTo(grandTotalTTC - grandTotalHT, 2);
    const grandTotalRemise = roundTo(totals.totalRemise, 2);

    return { totalHT: grandTotalHT, totalTTC: grandTotalTTC, totalTVA: grandTotalTVA, totalRemise: grandTotalRemise };
}

/**
 * Calcule un pourcentage, en s'assurant qu'il est entre 0 et 100.
 * @param {number} value - La valeur actuelle.
 * @param {number} total - La valeur totale.
 * @returns {number} Le pourcentage de 0 à 100.
 */
export const getPercentage = (value, total) => {
  const val = ensureNumber(value);
  const tot = ensureNumber(total);
  if (tot === 0) return 0;
  return Math.min(Math.max((val / tot) * 100, 0), 100);
};