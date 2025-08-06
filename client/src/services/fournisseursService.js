// client/src/services/fournisseursService.js
// ==============================================================================
//           Service pour les Appels API liés aux Fournisseurs
//
// Ce service encapsule tous les appels réseau vers les endpoints /fournisseurs.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Récupère une liste paginée et filtrée de fournisseurs.
 * @param {object} params - Les paramètres de la query string (page, limit, sort, search).
 * @returns {Promise<object>} La liste des fournisseurs et les métadonnées de pagination.
 */
const getAllFournisseurs = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.FOURNISSEURS, { params });
  return response.data;
};

/**
 * Récupère un fournisseur par son ID.
 * @param {string} fournisseurId - L'ID du fournisseur.
 * @returns {Promise<object>} Les données du fournisseur.
 */
const getFournisseurById = async (fournisseurId) => {
  const response = await apiClient.get(`${API_ENDPOINTS.FOURNISSEURS}/${fournisseurId}`);
  return response.data.data;
};

/**
 * Crée un nouveau fournisseur.
 * @param {object} fournisseurData - Les données du nouveau fournisseur.
 * @returns {Promise<object>} Le fournisseur nouvellement créé.
 */
const createFournisseur = async (fournisseurData) => {
  const response = await apiClient.post(API_ENDPOINTS.FOURNISSEURS, fournisseurData);
  return response.data.data;
};

/**
 * Met à jour un fournisseur existant.
 * @param {string} fournisseurId - L'ID du fournisseur à mettre à jour.
 * @param {object} updateData - Les données à mettre à jour.
 * @returns {Promise<object>} Le fournisseur mis à jour.
 */
const updateFournisseur = async (fournisseurId, updateData) => {
  const response = await apiClient.patch(`${API_ENDPOINTS.FOURNISSEURS}/${fournisseurId}`, updateData);
  return response.data.data;
};

/**
 * Désactive (soft delete) un fournisseur.
 * @param {string} fournisseurId - L'ID du fournisseur à désactiver.
 * @returns {Promise<void>}
 */
const deleteFournisseur = async (fournisseurId) => {
  await apiClient.delete(`${API_ENDPOINTS.FOURNISSEURS}/${fournisseurId}`);
};


// On exporte un objet contenant toutes les fonctions du service
const fournisseursService = {
  getAllFournisseurs,
  getFournisseurById,
  createFournisseur,
  updateFournisseur,
  deleteFournisseur,
};

export default fournisseursService;