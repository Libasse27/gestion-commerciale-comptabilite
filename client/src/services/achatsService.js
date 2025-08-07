// client/src/services/achatsService.js
import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

const getAllFacturesAchat = async (params = {}) => {
  const response = await apiClient.get(API_ENDPOINTS.FACTURES_ACHAT, { params });
  return response.data;
};

const getFactureAchatById = async (factureAchatId) => {
  const response = await apiClient.get(`${API_ENDPOINTS.FACTURES_ACHAT}/${factureAchatId}`);
  return response.data.data;
};

const createFactureAchat = async (factureAchatData) => {
  const response = await apiClient.post(API_ENDPOINTS.FACTURES_ACHAT, factureAchatData);
  return response.data.data;
};

const updateFactureAchat = async (factureAchatId, updateData) => {
  const response = await apiClient.patch(`${API_ENDPOINTS.FACTURES_ACHAT}/${factureAchatId}`, updateData);
  return response.data.data;
};

const deleteFactureAchat = async (factureAchatId) => {
  await apiClient.delete(`${API_ENDPOINTS.FACTURES_ACHAT}/${factureAchatId}`);
};

const achatsService = {
  getAllFacturesAchat,
  getFactureAchatById,
  createFactureAchat,
  updateFactureAchat,
  deleteFactureAchat,
};

export default achatsService;