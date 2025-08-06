// client/src/services/ventesService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

// --- DEVIS ---
const getAllDevis = async (params = {}) => { /* ... */ };
const createDevis = async (devisData) => { /* ... */ };
const convertDevisToCommande = async (devisId) => { /* ... */ };
/**
 * Récupère un devis par son ID.
 */
const getDevisById = async (devisId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.DEVIS}/${devisId}`);
    return response.data.data;
};

// --- COMMANDES ---
const getAllCommandes = async (params = {}) => { /* ... */ };
/**
 * Récupère une commande par son ID.
 */
const getCommandeById = async (commandeId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.COMMANDES}/${commandeId}`);
    return response.data.data;
};

// --- FACTURES ---
const getAllFactures = async (params = {}) => { /* ... */ };
const createFactureFromCommande = async (commandeId) => { /* ... */ };
const validateFacture = async (factureId) => { /* ... */ };
/**
 * Récupère une facture par son ID.
 */
const getFactureById = async (factureId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.FACTURES}/${factureId}`);
    return response.data.data;
};

// --- BONS DE LIVRAISON ---
/**
 * Récupère un bon de livraison par son ID.
 */
const getBonLivraisonById = async (blId) => {
    const response = await apiClient.get(`${API_ENDPOINTS.VENTES}/bon-livraisons/${blId}`);
    return response.data.data;
};


const ventesService = {
  // Devis
  getAllDevis,
  getDevisById,
  createDevis,
  convertDevisToCommande,
  // Commandes
  getAllCommandes,
  getCommandeById,
  // Factures
  getAllFactures,
  getFactureById,
  createFactureFromCommande,
  validateFacture,
  // BLs
  getBonLivraisonById,
};

export default ventesService;