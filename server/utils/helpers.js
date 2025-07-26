// ==============================================================================
//                  Fonctions d'Aide Utilitaires et Génériques
//
// Ce fichier contient une collection de fonctions utilitaires pures et
// réutilisables. Elles ne devraient pas avoir de dépendances avec les
// modèles ou les services de l'application.
//
// Leur but est de simplifier les tâches répétitives et de garder le code
// des services et contrôleurs concentré sur la logique métier.
// ==============================================================================

/**
 * Génère une chaîne de caractères aléatoire de la longueur spécifiée.
 * Utile pour créer des mots de passe temporaires, des tokens de réinitialisation, etc.
 * @param {number} length - La longueur de la chaîne à générer.
 * @returns {string} La chaîne aléatoire générée.
 */
const generateRandomString = (length) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Formate un nombre en devise XOF (Franc CFA) avec les séparateurs appropriés.
 * @param {number} amount - Le montant à formater.
 * @returns {string} Le montant formaté (ex: "1 234 567 FCFA").
 */
const formatCurrencyXOF = (amount) => {
  if (typeof amount !== 'number') return '0 FCFA';
  return new Intl.NumberFormat('fr-SN', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Calcule le total HT et TTC d'une ligne de document (facture, devis...).
 * @param {object} line - La ligne contenant quantité, prix unitaire, remise et tva.
 * @param {number} line.quantite - La quantité.
 * @param {number} line.prixUnitaire - Le prix unitaire HT.
 * @param {number} [line.remise=0] - Le pourcentage de remise (ex: 10 pour 10%).
 * @param {number} [line.tva=18] - Le pourcentage de TVA (ex: 18 pour 18%).
 * @returns {{totalHT: number, totalTTC: number, montantTVA: number, montantRemise: number}} - Un objet avec les totaux calculés.
 */
const calculateLineTotals = ({ quantite, prixUnitaire, remise = 0, tva = 18 }) => {
  const baseHT = quantite * prixUnitaire;
  const montantRemise = baseHT * (remise / 100);
  const totalHT = baseHT - montantRemise;
  const montantTVA = totalHT * (tva / 100);
  const totalTTC = totalHT + montantTVA;

  return { totalHT, totalTTC, montantTVA, montantRemise };
};

/**
 * Capitalise la première lettre d'une chaîne de caractères.
 * @param {string} str - La chaîne à capitaliser.
 * @returns {string} La chaîne capitalisée.
 */
const capitalizeFirstLetter = (str) => {
  if (typeof str !== 'string' || str.length === 0) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Calcule un pourcentage d'avancement.
 * @param {number} current - La valeur actuelle.
 * @param {number} total - La valeur totale.
 * @returns {number} Le pourcentage (de 0 à 100).
 */
const calculatePercentage = (current, total) => {
  if (total === 0) return 0;
  return Math.round((current / total) * 100);
};

/**
 * Supprime les propriétés null ou undefined d'un objet.
 * Utile avant une mise à jour pour ne pas écraser des champs existants avec des valeurs vides.
 * @param {object} obj - L'objet à nettoyer.
 * @returns {object} L'objet nettoyé.
 */
const removeNullOrUndefinedProps = (obj) => {
  const newObj = {};
  for (const key in obj) {
    if (obj[key] !== null && obj[key] !== undefined) {
      newObj[key] = obj[key];
    }
  }
  return newObj;
};


module.exports = {
  generateRandomString,
  formatCurrencyXOF,
  calculateLineTotals,
  capitalizeFirstLetter,
  calculatePercentage,
  removeNullOrUndefinedProps,
};