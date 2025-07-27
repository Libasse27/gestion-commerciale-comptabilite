// ==============================================================================
//                  Utilitaire de Manipulation des Nombres (Client)
//
// Ce fichier contient des fonctions d'aide pour les opérations numériques
// côté client. Il aide à effectuer des calculs fiables dans les formulaires,
// à valider des entrées numériques et à éviter les imprécisions de la
// virgule flottante en JavaScript.
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
 * Très utile pour nettoyer les entrées de formulaire avant calcul.
 * @param {*} value - La valeur à parser.
 * @param {number} [defaultValue=0] - La valeur à retourner si l'entrée est invalide.
 * @returns {number}
 */
export const parseNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(value);
  return isNaN(num) ? defaultValue : num;
};


/**
 * Calcule le total d'une ligne de document (devis, facture) côté client.
 * @param {object} line - L'objet représentant la ligne.
 * @param {number | string} line.quantite
 * @param {number | string} line.prixUnitaire
 * @param {number | string} [line.remise=0] - Remise en pourcentage.
 * @param {number | string} [line.tva=18] - TVA en pourcentage.
 * @returns {{totalHT: number, totalTTC: number}}
 */
export const calculateLineTotal = ({ quantite, prixUnitaire, remise = 0, tva = 18 }) => {
  const qte = parseNumber(quantite);
  const pu = parseNumber(prixUnitaire);
  const rem = parseNumber(remise);
  const tvaRate = parseNumber(tva);

  const baseHT = qte * pu;
  const montantRemise = baseHT * (rem / 100);
  const totalHT = baseHT - montantRemise;
  const montantTVA = totalHT * (tvaRate / 100);
  const totalTTC = totalHT + montantTVA;

  return {
    totalHT: roundTo(totalHT, 2),
    totalTTC: roundTo(totalTTC, 2),
  };
};

/**
 * Calcule les totaux globaux à partir d'un tableau de lignes.
 * @param {Array<object>} lines - Le tableau des lignes de la facture ou du devis.
 * @returns {{totalHT: number, totalTTC: number, totalTVA: number}}
 */
export const calculateGrandTotals = (lines) => {
    let totalHT = 0;
    let totalTTC = 0;

    lines.forEach(line => {
        const lineTotals = calculateLineTotal(line);
        totalHT += lineTotals.totalHT;
        totalTTC += lineTotals.totalTTC;
    });

    const grandTotalHT = roundTo(totalHT, 2);
    const grandTotalTTC = roundTo(totalTTC, 2);
    const grandTotalTVA = roundTo(grandTotalTTC - grandTotalHT, 2);

    return { totalHT: grandTotalHT, totalTTC: grandTotalTTC, totalTVA: grandTotalTVA };
}


/**
 * Calcule un pourcentage pour les barres de progression, etc.
 * @param {number} value - La valeur actuelle.
 * @param {number} total - La valeur totale.
 * @returns {number} Le pourcentage de 0 à 100, ou 0 si total est 0.
 */
export const getPercentage = (value, total) => {
  const val = parseNumber(value);
  const tot = parseNumber(total);

  if (tot === 0) return 0;
  
  return Math.min(Math.max((val / tot) * 100, 0), 100);
};