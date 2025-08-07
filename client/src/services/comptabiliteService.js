// client/src/services/comptabiliteService.js
// ==============================================================================
//           Service pour les Appels API liés à la Comptabilité
//
// Ce service encapsule tous les appels réseau vers les endpoints /comptabilite.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

// --- PLAN COMPTABLE ---

/**
 * Récupère le plan comptable complet.
 * @returns {Promise<Array<object>>}
 */
const getPlanComptable = async () => {
  const response = await apiClient.get(API_ENDPOINTS.PLAN_COMPTABLE);
  return response.data.data.comptes;
};

// --- ÉCRITURES ---

/**
 * Récupère une liste paginée d'écritures comptables.
 * @param {object} params - Les paramètres de la query string (page, limit, etc.).
 * @returns {Promise<object>}
 */
const getAllEcritures = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.ECRITURES, { params });
  return response.data;
};

/**
 * Crée une nouvelle écriture manuelle.
 * @param {object} ecritureData
 * @returns {Promise<object>}
 */
const createEcriture = async (ecritureData) => {
  const response = await apiClient.post(API_ENDPOINTS.ECRITURES, ecritureData);
  return response.data.data;
};

/**
 * Valide une écriture comptable.
 * @param {string} ecritureId
 * @returns {Promise<object>}
 */
const validerEcriture = async (ecritureId) => {
  const response = await apiClient.post(`${API_ENDPOINTS.ECRITURES}/${ecritureId}/valider`);
  return response.data.data;
};

// --- RAPPORTS ---

/**
 * Génère une balance générale pour une période.
 * @param {{dateDebut: string, dateFin: string}} params
 * @returns {Promise<object>}
 */
const getBalanceGenerale = async (params) => {
    const response = await apiClient.get(API_ENDPOINTS.RAPPORT_BALANCE, { params });
    return response.data.data;
};


// --- EXPORT ---
const comptabiliteService = {
  // Plan Comptable
  getPlanComptable,
  // Écritures
  getAllEcritures,
  createEcriture,
  validerEcriture,
  // Rapports
  getBalanceGenerale,
};

export default comptabiliteService;