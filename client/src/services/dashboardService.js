// client/src/services/dashboardService.js
// ==============================================================================
//           Service pour les Appels API liés au Tableau de Bord
//
// Ce service encapsule tous les appels réseau vers les endpoints du
// tableau de bord et des rapports.
// Il est utilisé par les thunks Redux pour récupérer les données analytiques.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Récupère toutes les données agrégées pour le tableau de bord principal.
 * @returns {Promise<object>} Les données complètes du tableau de bord.
 */
const getMainDashboardData = async () => {
  const response = await apiClient.get(API_ENDPOINTS.DASHBOARD);
  return response.data.data; // On retourne directement l'objet de données
};

/**
 * Récupère les KPIs commerciaux pour une période donnée.
 * @param {{dateDebut: string, dateFin: string}} params - Les dates de la période.
 * @returns {Promise<object>}
 */
const getKpisCommerciaux = async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.KPIS_COMMERCIAUX, { params });
    return response.data.data;
}

/**
 * Récupère les KPIs de trésorerie.
 * @returns {Promise<object>}
 */
const getKpisTresorerie = async () => {
    const response = await apiClient.get(API_ENDPOINTS.KPIS_TRESORERIE);
    return response.data.data;
}


// On exporte un objet contenant toutes les fonctions du service
const dashboardService = {
  getMainDashboardData,
  getKpisCommerciaux,
  getKpisTresorerie,
};

export default dashboardService;