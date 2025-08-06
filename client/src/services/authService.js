import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/** @typedef {import('./api.js').AuthResponse} AuthResponse */

const login = async (credentials) => {
  const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
  return response.data;
};

const register = async (userData) => {
  const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
  return response.data;
};

const logout = async () => {
  await apiClient.post(API_ENDPOINTS.LOGOUT, {});
};

const requestPasswordReset = async (email) => {
  const response = await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
  return response.data;
};

const resetPassword = async (token, password) => {
  const url = `${API_ENDPOINTS.RESET_PASSWORD}/${token}`;
  const response = await apiClient.patch(url, { password });
  return response.data;
};

const updateMyPassword = async (passwords) => {
  const response = await apiClient.patch(API_ENDPOINTS.UPDATE_MY_PASSWORD, passwords);
  return response.data; // Retourner les données pour le thunk
};

const authService = {
  login,
  register,
  logout,
  requestPasswordReset,
  resetPassword,
  updateMyPassword,
};

export default authService;