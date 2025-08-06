// client/src/services/achatsService.js
// ==============================================================================
//           Service pour les Appels API liés au Cycle d'Achat
//
// Ce service encapsule tous les appels réseau vers les endpoints /achats.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Récupère une liste paginée de factures d'achat.
 * @param {object} params - Les paramètres de la query string (page, limit, etc.).
 * @returns {Promise<object>}
 */
const getAllFacturesAchat = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.FACTURES_ACHAT, { params });
  return response.data;
};

/**
 * Récupère une facture d'achat par son ID.
 * @param {string} factureAchatId
 * @returns {Promise<object>}
 */
const getFactureAchatById = async (factureAchatId) => {
  const response = await apiClient.get(`${API_ENDPOINTS.FACTURES_ACHAT}/${factureAchatId}`);
  return response.data.data;
};

/**
 * Crée une nouvelle facture d'achat.
 * @param {object} factureAchatData
 * @returns {Promise<object>}
 */
const createFactureAchat = async (factureAchatData) => {
  const response = await apiClient.post(API_ENDPOINTS.FACTURES_ACHAT, factureAchatData);
  return response.data.data;
};

/**
 * Met à jour une facture d'achat.
 * @param {string} factureAchatId
 * @param {object} updateData
 * @returns {Promise<object>}
 */
const updateFactureAchat = async (factureAchatId, updateData) => {
  const response = await apiClient.patch(`${API_ENDPOINTS.FACTURES_ACHAT}/${factureAchatId}`, updateData);
  return response.data.data;
};

/**
 * Supprime une facture d'achat.
 * @param {string} factureAchatId
 * @returns {Promise<void>}
 */
const deleteFactureAchat = async (factureAchatId) => {
  await apiClient.delete(`${API_ENDPOINTS.FACTURES_ACHAT}/${factureAchatId}`);
};


const achatsService = {
  getAllFacturesAchat,
  getFactureAchatById,
  createFactureAchat,
  updateFactureAchat,
  deleteFactureAchat,
};

export default achatsService;