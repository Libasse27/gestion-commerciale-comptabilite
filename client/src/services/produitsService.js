// client/src/services/produitsService.js
// ==============================================================================
//           Service pour les Appels API liés au Catalogue
//
// Ce service encapsule tous les appels réseau vers les endpoints /produits.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

// --- PRODUITS ---

/**
 * Récupère une liste paginée et filtrée de produits.
 * @param {object} params - Les paramètres de la query string (page, limit, sort, search).
 * @returns {Promise<object>}
 */
const getAllProduits = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.PRODUITS, { params });
  return response.data;
};

/**
 * Récupère un produit par son ID.
 * @param {string} produitId
 * @returns {Promise<object>}
 */
const getProduitById = async (produitId) => {
  const response = await apiClient.get(`${API_ENDPOINTS.PRODUITS}/${produitId}`);
  return response.data.data;
};

/**
 * Crée un nouveau produit.
 * @param {object} produitData
 * @returns {Promise<object>}
 */
const createProduit = async (produitData) => {
  const response = await apiClient.post(API_ENDPOINTS.PRODUITS, produitData);
  return response.data.data;
};

/**
 * Met à jour un produit existant.
 * @param {string} produitId
 * @param {object} updateData
 * @returns {Promise<object>}
 */
const updateProduit = async (produitId, updateData) => {
  const response = await apiClient.patch(`${API_ENDPOINTS.PRODUITS}/${produitId}`, updateData);
  return response.data.data;
};

/**
 * Désactive (soft delete) un produit.
 * @param {string} produitId
 * @returns {Promise<void>}
 */
const deleteProduit = async (produitId) => {
  await apiClient.delete(`${API_ENDPOINTS.PRODUITS}/${produitId}`);
};


// --- CATEGORIES ---

/**
 * Récupère toutes les catégories de produits.
 * @returns {Promise<Array<object>>}
 */
const getAllCategories = async () => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES);
    return response.data.data.categories;
};

/**
 * Crée une nouvelle catégorie.
 * @param {object} categorieData
 * @returns {Promise<object>}
 */
const createCategorie = async (categorieData) => {
    const response = await apiClient.post(API_ENDPOINTS.CATEGORIES, categorieData);
    return response.data.data.categorie;
};


// --- EXPORT ---
const produitsService = {
  // Produits
  getAllProduits,
  getProduitById,
  createProduit,
  updateProduit,
  deleteProduit,
  // Catégories
  getAllCategories,
  createCategorie,
};

export default produitsService;