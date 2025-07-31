// ==============================================================================
//           Service pour les Appels API du Tableau de Bord
//
// Rôle : Ce fichier centralise tous les appels API liés à la récupération
// des données pour les différents tableaux de bord de l'application.
//
// MISE À JOUR : Ajout de la gestion d'erreurs (try/catch) pour rendre
// le service plus robuste et faciliter le débogage.
// ==============================================================================

import apiClient from './api';

/**
 * [OPTIMISÉ] Récupère toutes les données nécessaires pour le tableau de bord
 * principal en un seul appel API. Cet endpoint est la méthode préférée.
 * @throws {Error} Relance l'erreur API si l'appel échoue, pour que createAsyncThunk puisse la gérer.
 * @returns {Promise<object>} Un objet contenant toutes les données du dashboard.
 */
const getMainDashboardData = async () => {
  try {
    // Cet endpoint unique est géré par `dashboardController.js` côté backend
    const response = await apiClient.get('/dashboard/main');
    
    // La convention est de retourner la propriété `data` de la réponse Axios.
    // Le contrôleur backend devrait renvoyer un objet contenant toutes les données.
    return response.data.data;
  } catch (error) {
    // On log l'erreur pour un débogage facile côté client
    console.error("Erreur lors de la récupération des données du dashboard principal :", error.response?.data || error.message);
    // On relance l'erreur pour que le `createAsyncThunk` qui a appelé ce service
    // puisse passer dans son état `rejected`. C'est crucial.
    throw error;
  }
};

// --- Fonctions Individuelles (gardées pour des cas d'usage spécifiques) ---
// Note : Ces fonctions créent des appels réseau supplémentaires.
// À n'utiliser que si une fonctionnalité nécessite de rafraîchir
// une seule partie du tableau de bord (ex: un bouton "Rafraîchir les KPIs").

/**
 * Récupère les indicateurs de performance clés (KPIs) uniquement.
 * @throws {Error} Relance l'erreur API si l'appel échoue.
 * @returns {Promise<object>} L'objet contenant les KPIs.
 */
const getKpisCommerciaux = async () => {
  try {
    const response = await apiClient.get('/kpis/commerciaux');
    return response.data.data.kpis || {};
  } catch (error) {
    console.error("Erreur lors de la récupération des KPIs commerciaux :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Récupère les données des ventes mensuelles sur les 12 derniers mois.
 * @throws {Error} Relance l'erreur API si l'appel échoue.
 * @returns {Promise<Array<object>>}
 */
const getVentesAnnuelles = async () => {
  try {
    const response = await apiClient.get('/statistiques/ventes-annuelles');
    return response.data.data.ventesMensuelles || [];
  } catch (error) {
    console.error("Erreur lors de la récupération des ventes annuelles :", error.response?.data || error.message);
    throw error;
  }
};


// On exporte un objet contenant toutes les fonctions du service.
const dashboardService = {
  getMainDashboardData,
  getKpisCommerciaux,
  getVentesAnnuelles,
};

export default dashboardService;