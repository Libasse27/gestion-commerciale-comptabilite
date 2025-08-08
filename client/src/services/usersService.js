// client/src/services/usersService.js
// ==============================================================================
//           Service pour les Appels API liés à la Gestion des Utilisateurs
//
// Ce service encapsule tous les appels réseau vers les endpoints /users.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Récupère une liste d'utilisateurs.
 * @param {object} params - Les paramètres de la query string (page, limit, etc.).
 * @returns {Promise<object>}
 */
const getAllUsers = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.USERS, { params });
  return response.data;
};

/**
 * Récupère un utilisateur par son ID.
 * @param {string} userId
 * @returns {Promise<object>}
 */
const getUserById = async (userId) => {
  const response = await apiClient.get(`${API_ENDPOINTS.USERS}/${userId}`);
  return response.data.data;
};

/**
 * Crée un nouvel utilisateur.
 * @param {object} userData
 * @returns {Promise<object>}
 */
const createUser = async (userData) => {
  const response = await apiClient.post(API_ENDPOINTS.USERS, userData);
  return response.data.data;
};

/**
 * Met à jour un utilisateur.
 * @param {string} userId
 * @param {object} updateData
 * @returns {Promise<object>}
 */
const updateUser = async (userId, updateData) => {
  const response = await apiClient.patch(`${API_ENDPOINTS.USERS}/${userId}`, updateData);
  return response.data.data;
};

/**
 * Désactive (soft delete) un utilisateur.
 * @param {string} userId
 * @returns {Promise<void>}
 */
const deleteUser = async (userId) => {
  await apiClient.delete(`${API_ENDPOINTS.USERS}/${userId}`);
};


const usersService = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};

export default usersService;