// client/src/services/paiementsService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

// --- TRANSACTIONS ---
const getAllPaiements = async (params = {}) => { /*...*/ };
const getPaiementById = async (paiementId) => { /*...*/ };
const createEncaissement = async (paiementData) => { /*...*/ };
const createDecaissement = async (paiementData) => { /*...*/ };

// --- ÉCHÉANCIERS ---
const getEcheancierByFacture = async (factureId) => { /*...*/ };

/**
 * Récupère toutes les lignes d'échéance à venir.
 * @param {object} params - Paramètres de query string.
 * @returns {Promise<object>}
 */
const getAllEcheances = async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.ECHEANCIERS, { params });
    return response.data;
};


// --- RELANCES ---
const getAllRelances = async (params = {}) => { /*...*/ };


const paiementsService = {
  getAllPaiements,
  getPaiementById,
  createEncaissement,
  createDecaissement,
  getEcheancierByFacture,
  getAllEcheances, // <-- AJOUTER
  getAllRelances,
};

export default paiementsService;