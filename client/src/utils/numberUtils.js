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
 * Très utile pour nettoyer les entrées de formulaire avant tout calcul.
 * @param {*} value - La valeur à parser.
 * @param {number} [defaultValue=0] - La valeur à retourner si l'entrée est invalide.
 * @returns {number}
 */
export const ensureNumber = (value, defaultValue = 0) => {
  if (value === null || value === undefined || value === '') return defaultValue;
  const num = Number(String(value).replace(',', '.')); // Gère la virgule comme séparateur décimal
  return isNaN(num) ? defaultValue : num;
};


/**
 * Calcule le total d'une ligne de document (devis, facture) côté client.
 * @param {object} line - L'objet représentant la ligne.
 * @param {number | string} line.quantite
 * @param {number | string} line.prixUnitaire
 * @param {number | string} [line.remise=0] - Remise en pourcentage.
 * @param {number | string} [line.tva=18] - TVA en pourcentage.
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
 * @param {Array<object>} lines - Le tableau des lignes de la facture ou du devis.
 * @returns {{totalHT: number, totalTTC: number, totalTVA: number, totalRemise: number}}
 */
export const calculateGrandTotals = (lines) => {
    let totalHT = 0;
    let totalTTC = 0;
    let totalRemise = 0;

    if (!Array.isArray(lines)) {
        return { totalHT: 0, totalTTC: 0, totalTVA: 0, totalRemise: 0 };
    }

    lines.forEach(line => {
        const lineTotals = calculateLineTotals(line);
        totalHT += lineTotals.totalHT;
        totalTTC += lineTotals.totalTTC;
        totalRemise += lineTotals.montantRemise;
    });

    const grandTotalHT = roundTo(totalHT, 2);
    const grandTotalTTC = roundTo(totalTTC, 2);
    const grandTotalTVA = roundTo(grandTotalTTC - grandTotalHT, 2);
    const grandTotalRemise = roundTo(totalRemise, 2);

    return { totalHT: grandTotalHT, totalTTC: grandTotalTTC, totalTVA: grandTotalTVA, totalRemise: grandTotalRemise };
}


/**
 * Calcule un pourcentage pour les barres de progression, etc., en s'assurant qu'il est entre 0 et 100.
 * @param {number} value - La valeur actuelle.
 * @param {number} total - La valeur totale.
 * @returns {number} Le pourcentage de 0 à 100, ou 0 si total est 0.
 */
export const getPercentage = (value, total) => {
  const val = ensureNumber(value);
  const tot = ensureNumber(total);

  if (tot === 0) return 0;
  
  // Borne le résultat entre 0 et 100
  return Math.min(Math.max((val / tot) * 100, 0), 100);
};