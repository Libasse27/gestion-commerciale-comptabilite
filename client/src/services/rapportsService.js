// client/src/services/rapportsService.js
// ==============================================================================
//           Service pour les Appels API liés aux Rapports
//
// Ce service centralise tous les appels réseau vers les endpoints de reporting.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Récupère le rapport des ventes pour une période.
 * @param {{dateDebut: string, dateFin: string}} params
 * @returns {Promise<object>}
 */
const getRapportVentes = async (params) => {
  const response = await apiClient.get(API_ENDPOINTS.RAPPORT_VENTES, { params });
  return response.data.data;
};

/**
 * Récupère le rapport des achats pour une période.
 * @param {{dateDebut: string, dateFin: string}} params
 * @returns {Promise<object>}
 */
const getRapportAchats = async (params) => {
  const response = await apiClient.get(API_ENDPOINTS.RAPPORTS_ACHATS, { params }); // Assumer que cet endpoint existe
  return response.data.data;
};

/**
 * Récupère le rapport de stock.
 * @returns {Promise<object>}
 */
const getRapportStock = async () => {
  const response = await apiClient.get(API_ENDPOINTS.RAPPORTS_STOCK); // Assumer que cet endpoint existe
  return response.data.data;
};


// On exporte un objet contenant toutes les fonctions du service
const rapportsService = {
  getRapportVentes,
  getRapportAchats,
  getRapportStock,
};

export default rapportsService;