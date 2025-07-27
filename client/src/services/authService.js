// ==============================================================================
//           Service pour les Appels API liés à l'Authentification
//
// Ce service encapsule toutes les interactions avec les points de terminaison
// (endpoints) de l'API qui concernent l'authentification.
//
// Chaque fonction correspond à une route spécifique de l'API et utilise
// `apiClient` (notre instance Axios pré-configurée) pour effectuer les requêtes.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS, LOCAL_STORAGE_KEYS } from '../utils/constants';

/**
 * Envoie une requête de connexion à l'API.
 * @param {object} credentials - Un objet contenant l'email et le mot de passe.
 * @param {string} credentials.email
 * @param {string} credentials.password
 * @returns {Promise<object>} La réponse de l'API contenant les tokens et les données utilisateur.
 */
const login = async (credentials) => {
  const response = await apiClient.post(API_ENDPOINTS.LOGIN, credentials);
  return response.data;
};

/**
 * Envoie une requête d'inscription à l'API.
 * @param {object} userData - Un objet contenant les informations du nouvel utilisateur.
 * @param {string} userData.firstName
 * @param {string} userData.lastName
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<object>} La réponse de l'API contenant le nouvel utilisateur.
 */
const register = async (userData) => {
  const response = await apiClient.post(API_ENDPOINTS.REGISTER, userData);
  return response.data;
};

/**
 * Déconnecte l'utilisateur en supprimant les données du localStorage.
 * Pour une authentification JWT stateless, aucun appel API n'est nécessaire.
 * La logique de suppression effective se trouve dans le authMiddleware,
 * mais c'est une bonne pratique d'avoir la fonction ici.
 */
const logout = () => {
  localStorage.removeItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(LOCAL_STORAGE_KEYS.USER_INFO);
};

/**
 * Demande un nouveau token d'accès en utilisant le refresh token.
 * @returns {Promise<object>} La réponse contenant le nouvel accessToken.
 */
const refreshToken = async () => {
  const currentRefreshToken = localStorage.getItem(LOCAL_STORAGE_KEYS.REFRESH_TOKEN);
  if (!currentRefreshToken) {
    throw new Error('No refresh token available');
  }
  const response = await apiClient.post(API_ENDPOINTS.REFRESH_TOKEN, { token: currentRefreshToken });
  
  // Mettre à jour le nouveau token d'accès dans le localStorage
  if (response.data && response.data.accessToken) {
    localStorage.setItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN, response.data.accessToken);
  }

  return response.data;
};

/**
 * Récupère les informations de l'utilisateur actuellement connecté.
 * L'API doit avoir une route (ex: /users/me) qui utilise le token pour identifier l'utilisateur.
 * @returns {Promise<object>} Les données de l'utilisateur.
 */
const getMe = async () => {
  // Le token est ajouté automatiquement par l'intercepteur d'apiClient
  const response = await apiClient.get('/users/me'); // Endpoint à créer côté backend
  return response.data;
}


// On exporte un objet contenant toutes les fonctions du service
const authService = {
  login,
  register,
  logout,
  refreshToken,
  getMe,
};

export default authService;