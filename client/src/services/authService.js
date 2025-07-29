// ==============================================================================
//           Service pour les Appels API liés à l'Authentification
//
// MISE À JOUR : Ajout des fonctions pour le processus de réinitialisation
// de mot de passe.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS, LOCAL_STORAGE_KEYS } from '../utils/constants';

/**
 * Envoie une requête de connexion à l'API.
 */
const login = async (credentials) => {
  const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
  return response.data;
};

/**
 * Envoie une requête d'inscription à l'API.
 */
const register = async (userData) => {
  const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
  return response.data;
};

/**
 * Déconnecte l'utilisateur en supprimant les données du localStorage.
 */
const logout = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);
};

/**
 * Envoie une requête pour demander un lien de réinitialisation de mot de passe.
 * @param {string} email - L'email de l'utilisateur.
 * @returns {Promise<object>}
 */
const requestPasswordReset = async (email) => {
  const response = await apiClient.post(API_ENDPOINTS.REQUEST_PASSWORD_RESET, { email });
  return response.data;
};

/**
 * Envoie le token et le nouveau mot de passe à l'API pour finaliser la réinitialisation.
 * @param {string} token - Le token de réinitialisation reçu de l'URL.
 * @param {string} password - Le nouveau mot de passe.
 * @returns {Promise<object>}
 */
const resetPassword = async (token, password) => {
  // Construit l'URL dynamique avec le token
  const url = `/auth/reset-password/${token}`;
  const response = await apiClient.patch(url, { password });
  return response.data;
};


// On exporte un objet contenant toutes les fonctions du service
const authService = {
  login,
  register,
  logout,
  requestPasswordReset,
  resetPassword,
  // refreshToken et getMe ont été retirés car leur logique est mieux gérée
  // respectivement par l'intercepteur d'api.js et par un futur userService.
};

export default authService;