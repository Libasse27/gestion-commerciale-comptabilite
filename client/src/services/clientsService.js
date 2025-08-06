// client/src/services/clientsService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Récupère une liste paginée et filtrée de clients.
 */
const getAllClients = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.CLIENTS, { params });
  return response.data;
};

/**
 * Récupère un client par son ID.
 */
const getClientById = async (clientId) => {
  const response = await apiClient.get(`${API_ENDPOINTS.CLIENTS}/${clientId}`);
  return response.data.data;
};

/**
 * Crée un nouveau client.
 */
const createClient = async (clientData) => {
  const response = await apiClient.post(API_ENDPOINTS.CLIENTS, clientData);
  return response.data.data;
};

/**
 * Met à jour un client.
 */
const updateClient = async (clientId, updateData) => {
  const response = await apiClient.patch(`${API_ENDPOINTS.CLIENTS}/${clientId}`, updateData);
  return response.data.data;
};

/**
 * Désactive (soft delete) un client.
 */
const deleteClient = async (clientId) => {
  await apiClient.delete(`${API_ENDPOINTS.CLIENTS}/${clientId}`);
};

/**
 * Récupère les KPIs pour un client spécifique.
 */
const getClientKpis = async (clientId) => {
    // Note : Cet endpoint est techniquement sous '/statistiques', mais il concerne un client.
    // Le placer ici garde la logique client-centrique regroupée.
    const response = await apiClient.get(`/statistiques/clients/${clientId}`);
    return response.data.data;
};

const clientsService = {
  getAllClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientKpis, // <-- Exporter la nouvelle fonction
};

export default clientsService;