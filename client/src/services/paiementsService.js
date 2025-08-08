// client/src/services/paiementsService.js
// ==============================================================================
//           Service pour les Appels API liés aux Paiements
//
// Ce service encapsule tous les appels réseau vers les endpoints /paiements.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

// --- TRANSACTIONS DE PAIEMENT ---

/**
 * Récupère une liste paginée de paiements.
 * @param {object} params - Les paramètres de la query string (page, limit, etc.).
 * @returns {Promise<object>}
 */
const getAllPaiements = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.PAIEMENTS, { params });
  return response.data;
};

/**
 * Récupère un paiement par son ID.
 * @param {string} paiementId
 * @returns {Promise<object>}
 */
const getPaiementById = async (paiementId) => {
  const response = await apiClient.get(`${API_ENDPOINTS.PAIEMENTS}/${paiementId}`);
  return response.data.data;
};

/**
 * Enregistre un nouvel encaissement client.
 * @param {object} paiementData
 * @returns {Promise<object>}
 */
const createEncaissement = async (paiementData) => {
  const response = await apiClient.post(API_ENDPOINTS.ENCAISSEMENTS, paiementData);
  return response.data.data;
};

/**
 * Enregistre un nouveau décaissement fournisseur.
 * @param {object} paiementData
 * @returns {Promise<object>}
 */
const createDecaissement = async (paiementData) => {
  const response = await apiClient.post(API_ENDPOINTS.DECAISSEMENTS, paiementData);
  return response.data.data;
};


// --- ÉCHÉANCIERS ---

/**
 * Récupère l'échéancier pour une facture spécifique.
 * @param {string} factureId
 * @returns {Promise<object>}
 */
const getEcheancierByFacture = async (factureId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.ECHEANCIERS}/facture/${factureId}`);
    return response.data.data;
};


// --- RELANCES ---

/**
 * Récupère l'historique des relances.
 * @param {object} params - Paramètres de query string.
 * @returns {Promise<object>}
 */
const getAllRelances = async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.RELANCES, { params });
    return response.data;
};


// --- EXPORT ---
const paiementsService = {
  // Transactions
  getAllPaiements,
  getPaiementById,
  createEncaissement,
  createDecaissement,
  // Échéanciers
  getEcheancierByFacture,
  // Relances
  getAllRelances,
};

export default paiementsService;