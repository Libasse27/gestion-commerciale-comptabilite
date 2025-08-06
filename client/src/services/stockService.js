// client/src/services/stockService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

// --- DÉPÔTS ---
const getAllDepots = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.DEPOTS, { params });
  return response.data;
};
const createDepot = async (depotData) => {
  const response = await apiClient.post(API_ENDPOINTS.DEPOTS, depotData);
  return response.data.data;
};

// --- ÉTAT DU STOCK ---
const getEtatStockGlobal = async (params = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.STOCK}/etats`, { params });
    return response.data;
};

// --- MOUVEMENTS ---
/**
 * Récupère l'historique des mouvements pour un produit.
 * @param {string} produitId
 * @param {object} params - Paramètres de query string (page, limit).
 * @returns {Promise<object>}
 */
const getHistoriqueProduit = async (produitId, params = {}) => {
    const response = await apiClient.get(`${API_ENDPOINTS.MOUVEMENTS}/produit/${produitId}`, { params });
    return response.data;
};

// --- INVENTAIRES ---
const getAllInventaires = async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.INVENTAIRES, { params });
    return response.data;
};
const startInventaire = async (depotId) => {
    const response = await apiClient.post(API_ENDPOINTS.INVENTAIRES, { depotId });
    return response.data.data;
};
const validateInventaire = async (inventaireId) => {
    const response = await apiClient.post(`${API_ENDPOINTS.INVENTAIRES}/${inventaireId}/valider`);
    return response.data.data;
};

// --- ALERTES ---
const getAllAlertes = async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ALERTES, { params });
    return response.data;
};


const stockService = {
  // Dépôts
  getAllDepots,
  createDepot,
  // État du Stock
  getEtatStockGlobal,
  // Mouvements
  getHistoriqueProduit,
  // Inventaires
  getAllInventaires,
  startInventaire,
  validateInventaire,
  // Alertes
  getAllAlertes,
};

export default stockService;