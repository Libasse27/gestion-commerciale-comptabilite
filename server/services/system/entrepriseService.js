// server/services/system/entrepriseService.js
// ==============================================================================
//           Service "Façade" pour la Gestion des Informations de l'Entreprise
//
// Ce service agit comme une couche d'abstraction sémantique au-dessus du
// `parametrageService`.
//
// Il fournit des fonctions simples (`getInformations`) pour récupérer
// spécifiquement les paramètres liés à l'entreprise, rendant le code des
// autres services (comme `pdfService`) plus lisible.
// ==============================================================================

const parametrageService = require('./parametrageService');

/**
 * Récupère toutes les informations de l'entreprise et les formate dans un objet simple.
 * @returns {Promise<Object>} Un objet contenant les informations de l'entreprise.
 */
async function getInformations() {
  // 1. Récupérer tous les paramètres (qui sont mis en cache par le service sous-jacent)
  const allParams = await parametrageService.getAllParametres();

  // 2. Filtrer et reformater uniquement les paramètres qui commencent par "ENTREPRISE_"
  const entrepriseInfo = {};
  for (const key in allParams) {
    if (key.startsWith('ENTREPRISE_')) {
      // Transformer 'ENTREPRISE_NOM' en 'nom'
      const cleanKey = key.replace('ENTREPRISE_', '').toLowerCase();
      entrepriseInfo[cleanKey] = allParams[key];
    }
  }

  return entrepriseInfo;
}


/**
 * Met à jour les informations de l'entreprise.
 * @param {Object} dataToUpdate - Un objet où les clés sont les noms de champ simplifiés (ex: { nom: 'Nouveau Nom' }).
 * @param {string} userId - L'ID de l'utilisateur qui effectue la mise à jour.
 * @returns {Promise<Object>} Les nouvelles informations de l'entreprise.
 */
async function updateInformations(dataToUpdate, userId) {
    // 1. Transformer les clés simples en clés de paramètre complètes
    const updates = Object.entries(dataToUpdate).map(([key, value]) => {
        // Transformer 'nom' en 'ENTREPRISE_NOM'
        const fullKey = `ENTREPRISE_${key.toUpperCase()}`;
        return { cle: fullKey, valeur: value };
    });

    // 2. Appeler le service de paramétrage générique
    const updatedParams = await parametrageService.updateParametres(updates, userId);

    // 3. Renvoyer les informations de l'entreprise re-formatées
    return getInformations();
}


module.exports = {
  getInformations,
  updateInformations,
};