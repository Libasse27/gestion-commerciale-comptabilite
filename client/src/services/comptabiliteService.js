// client/src/services/comptabiliteService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

// --- PLAN COMPTABLE ---
const getPlanComptable = async () => {
    const response = await apiClient.get(API_ENDPOINTS.PLAN_COMPTABLE);
    return response.data.data.comptes;
};

// --- ÉCRITURES ---
const getAllEcritures = async (params = {}) => { /* ... */ };
const createEcriture = async (ecritureData) => { /* ... */ };
const validerEcriture = async (ecritureId) => { /* ... */ };

// --- RAPPORTS ---
const getBalanceGenerale = async (params) => { /* ... */ };
const getGrandLivre = async ({ compteId, dateDebut, dateFin }) => { /* ... */ };
const getBilan = async (dateFin) => { /* ... */ };

/**
 * Génère le compte de résultat pour une période.
 * @param {{dateDebut: string, dateFin: string}} params
 * @returns {Promise<object>}
 */
const getCompteDeResultat = async (params) => {
    // Note: l'endpoint exact doit être défini dans les constantes
    const response = await apiClient.get('/comptabilite/rapports/compte-de-resultat', { params });
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
  getCompteDeResultat, // <-- AJOUTER
};

export default comptabiliteService;