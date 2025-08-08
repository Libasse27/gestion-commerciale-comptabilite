// client/src/services/comptabiliteService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

// --- PLAN COMPTABLE ---
const getPlanComptable = async () => { /* ... */ };

// --- JOURNAUX ---
/**
 * Récupère la liste des journaux comptables.
 * @returns {Promise<Array<object>>}
 */
const getAllJournaux = async () => {
    // Il faudra créer cet endpoint côté backend
    const response = await apiClient.get('/comptabilite/journaux');
    return response.data.data.journaux;
};

// --- ÉCRITURES ---
const getAllEcritures = async (params = {}) => { /* ... */ };
const createEcriture = async (ecritureData) => { /* ... */ };
const validerEcriture = async (ecritureId) => { /* ... */ };

// --- RAPPORTS ---
const getBalanceGenerale = async (params) => { /* ... */ };
const getGrandLivre = async ({ compteId, dateDebut, dateFin }) => { /* ... */ };
const getBilan = async (dateFin) => { /* ... */ };
const getCompteDeResultat = async (params) => { /* ... */ };


const comptabiliteService = {
  getPlanComptable,
  getAllJournaux, // <-- AJOUTER
  getAllEcritures,
  createEcriture,
  validerEcriture,
  getBalanceGenerale,
  getGrandLivre,
  getBilan,
  getCompteDeResultat,
};

export default comptabiliteService;