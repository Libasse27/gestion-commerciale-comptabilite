// ==============================================================================
//                  Utilitaire de Manipulation des Nombres
//
// Ce fichier contient des fonctions d'aide pour toutes les opérations
// numériques critiques. Il vise à résoudre les problèmes d'imprécision
// de l'arithmétique à virgule flottante en JavaScript et à fournir des
// outils fiables pour les calculs financiers.
// ==============================================================================

/**
 * S'assure qu'une valeur est bien un nombre, sinon retourne une valeur par défaut.
 * Très utile pour nettoyer les entrées utilisateur avant calcul.
 * @param {*} value - La valeur à vérifier.
 * @param {number} [defaultValue=0] - La valeur à retourner si l'entrée n'est pas un nombre valide.
 * @returns {number}
 */
const ensureNumber = (value, defaultValue = 0) => {
    const num = Number(value);
    return isNaN(num) || num === null ? defaultValue : num;
};

/**
 * Arrondit un nombre à un nombre spécifié de décimales.
 * Gère les imprécisions de la virgule flottante en utilisant Number.EPSILON.
 * @param {number} num - Le nombre à arrondir.
 * @param {number} [decimals=2] - Le nombre de décimales souhaitées.
 * @returns {number} Le nombre arrondi.
 */
const roundTo = (num, decimals = 2) => {
    const value = ensureNumber(num);
    const shifter = Math.pow(10, decimals);
    // L'ajout de Number.EPSILON corrige les erreurs d'arrondi sur des cas comme (1.005 * 100)
    return Math.round((value + Number.EPSILON) * shifter) / shifter;
};

/**
 * Calcule la TVA pour un montant donné.
 * @param {number} amount - Le montant (HT).
 * @param {number} rate - Le taux de TVA en pourcentage (ex: 18 pour 18%).
 * @returns {number} Le montant de la TVA, arrondi à 2 décimales.
 */
const calculateTVA = (amount, rate) => {
    const value = ensureNumber(amount);
    const tvaRate = ensureNumber(rate);
    const tvaAmount = (value * tvaRate) / 100;
    return roundTo(tvaAmount, 2);
};

/**
 * Calcule le prix TTC à partir d'un prix HT et d'un taux de TVA.
 * @param {number} amountHT - Le montant hors taxes.
 * @param {number} rateTVA - Le taux de TVA en pourcentage.
 * @returns {number} Le montant toutes taxes comprises.
 */
const calculateTTC = (amountHT, rateTVA) => {
    const valueHT = ensureNumber(amountHT);
    const tva = calculateTVA(valueHT, rateTVA);
    return roundTo(valueHT + tva, 2);
};

/**
 * Calcule le prix HT à partir d'un prix TTC et d'un taux de TVA.
 * @param {number} amountTTC - Le montant toutes taxes comprises.
 * @param {number} rateTVA - Le taux de TVA en pourcentage.
 * @returns {number} Le montant hors taxes.
 */
const calculateHT = (amountTTC, rateTVA) => {
    const valueTTC = ensureNumber(amountTTC);
    const tvaRate = ensureNumber(rateTVA);
    const amountHT = valueTTC / (1 + tvaRate / 100);
    return roundTo(amountHT, 2);
};

/**
 * Calcule la marge en valeur absolue et en pourcentage.
 * @param {number} sellingPrice - Le prix de vente.
 * @param {number} costPrice - Le coût d'achat.
 * @returns {{marginValue: number, marginRate: number}} Un objet contenant la marge et le taux de marge.
 */
const calculateMargin = (sellingPrice, costPrice) => {
    const sp = ensureNumber(sellingPrice);
    const cp = ensureNumber(costPrice);

    const marginValue = sp - cp;
    // Évite la division par zéro si le coût d'achat est nul
    const marginRate = cp > 0 ? (marginValue / cp) * 100 : Infinity;

    return {
        marginValue: roundTo(marginValue, 2),
        marginRate: roundTo(marginRate, 2),
    };
};

module.exports = {
    roundTo,
    calculateTVA,
    calculateTTC,
    calculateHT,
    calculateMargin,
    ensureNumber,
};