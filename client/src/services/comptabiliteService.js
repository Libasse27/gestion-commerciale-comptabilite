// client/src/services/comptabiliteService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

// --- PLAN COMPTABLE ---
const getPlanComptable = async () => { /* ... */ };

// --- ÉCRITURES ---
const getAllEcritures = async (params = {}) => { /* ... */ };
const createEcriture = async (ecritureData) => { /* ... */ };
const validerEcriture = async (ecritureId) => { /* ... */ };

// --- RAPPORTS ---
const getBalanceGenerale = async (params) => { /* ... */ };

/**
 * Récupère le grand livre pour un compte et une période.
 * @param {{compteId: string, dateDebut: string, dateFin: string}} params
 * @returns {Promise<object>}
 */
const getGrandLivre = async ({ compteId, dateDebut, dateFin }) => {
    const response = await apiClient.get(`${API_ENDPOINTS.GRAND_LIVRE}/${compteId}`, {
        params: { dateDebut, dateFin }
    });
    return response.data.data;
};

/**
 * Génère le bilan à une date donnée.
 * @param {string} dateFin
 * @returns {Promise<object>}
 */
const getBilan = async (dateFin) => {
    const response = await apiClient.get(API_ENDPOINTS.RAPPORT_BILAN, { params: { dateFin } });
    return response.data.data;
};


const comptabiliteService = {
  // Plan Comptable
  getPlanComptable,
  // Écritures
  getAllEcritures,
  createEcriture,
  validerEcriture,
  // Rapports
  getBalanceGenerale,
  getGrandLivre,
  getBilan,
};

export default comptabiliteService;