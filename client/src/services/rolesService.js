// client/src/services/rolesService.js
// ==============================================================================
//           Service pour les Appels API liés à la Gestion des Rôles
//
// Ce service encapsule tous les appels réseau vers les endpoints /roles.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Récupère la liste de tous les rôles.
 * @returns {Promise<Array<object>>}
 */
const getAllRoles = async () => {
  const response = await apiClient.get(API_ENDPOINTS.ROLES);
  return response.data.data.roles;
};

/**
 * Récupère la liste de toutes les permissions disponibles.
 * @returns {Promise<object>} Un objet de permissions groupées.
 */
const getAllPermissions = async () => {
  const response = await apiClient.get(API_ENDPOINTS.PERMISSIONS);
  return response.data.data.permissions;
};

/**
 * Crée un nouveau rôle.
 * @param {object} roleData - Les données du nouveau rôle.
 * @returns {Promise<object>}
 */
const createRole = async (roleData) => {
  const response = await apiClient.post(API_ENDPOINTS.ROLES, roleData);
  return response.data.data;
};

/**
 * Met à jour un rôle existant.
 * @param {string} roleId - L'ID du rôle à mettre à jour.
 * @param {object} updateData - Les données à mettre à jour.
 * @returns {Promise<object>}
 */
const updateRole = async (roleId, updateData) => {
  const response = await apiClient.patch(`${API_ENDPOINTS.ROLES}/${roleId}`, updateData);
  return response.data.data;
};


const rolesService = {
  getAllRoles,
  getAllPermissions,
  createRole,
  updateRole,
};

export default rolesService;