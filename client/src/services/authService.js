// ==============================================================================
//           Service pour les Appels API liés à l'Authentification
//
// Ce service encapsule tous les appels réseau (via Axios) vers les
// endpoints d'authentification de l'API.
// Il est utilisé par les thunks/actions Redux pour interagir avec le backend.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Envoie une requête de connexion à l'API.
 * @param {{email: string, password: string}} credentials - Les identifiants de l'utilisateur.
 * @returns {Promise<object>} Les données de la réponse (contenant user, accessToken, etc.).
 */
const login = async (credentials) => {
  const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
  return response.data;
};

/**
 * Envoie une requête d'inscription à l'API.
 * @param {object} userData - Les données du nouvel utilisateur.
 * @returns {Promise<object>} Les données de la réponse.
 */
const register = async (userData) => {
  const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
  return response.data;
};

/**
 * Envoie une requête de déconnexion à l'API.
 * Le backend peut alors invalider le refresh token si nécessaire.
 * @returns {Promise<object>}
 */
const logout = async () => {
  // Même si la logique principale est de supprimer les tokens côté client,
  // appeler un endpoint de déconnexion est une bonne pratique pour permettre
  // au backend de faire du nettoyage (ex: invalider un refresh token).
  const response = await apiClient.post(API_ENDPOINTS.LOGOUT, {});
  return response.data;
};

/**
 * Envoie une requête pour demander un lien de réinitialisation de mot de passe.
 * @param {string} email - L'email de l'utilisateur.
 * @returns {Promise<object>}
 */
const requestPasswordReset = async (email) => {
  const response = await apiClient.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
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
  const url = `${API_ENDPOINTS.RESET_PASSWORD}/${token}`;
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
};

export default authService;