// ==============================================================================
//           Service pour les Appels API liés aux Clients (Version Finale)
//
// Rôle : Ce service est la seule porte d'entrée pour toutes les interactions
// avec la ressource "Client" de l'API. Il abstrait la logique des requêtes HTTP.
//
// Bonnes Pratiques :
// - Utilisation d'un `apiClient` centralisé (instance Axios).
// - Centralisation des endpoints via `API_ENDPOINTS`.
// - Gestion d'erreurs explicite avec `try...catch` dans chaque fonction.
// - Documentation JSDoc détaillée pour chaque méthode.
// ==============================================================================

import apiClient from './api';
import { API_ENDPOINTS } from '../utils/constants';

/**
 * Récupère une liste paginée et filtrée de clients.
 * @param {object} [params] - Les paramètres de la requête (page, limit, sort, filtres).
 * @throws {Error} Relance l'erreur API si l'appel échoue.
 * @returns {Promise<object>} La réponse de l'API (généralement { data: [...], pagination: {...} }).
 */
const getAll = async (params) => {
  try {
    const response = await apiClient.get(API_ENDPOINTS.CLIENTS, { params });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste des clients :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Récupère un client spécifique par son ID.
 * @param {string} id - L'ID unique du client.
 * @throws {Error} Relance l'erreur API si l'appel échoue.
 * @returns {Promise<object>} La réponse de l'API contenant les données du client.
 */
const getById = async (id) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.CLIENTS}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération du client ${id} :`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Crée un nouveau client.
 * @param {object} clientData - Les données du client à créer.
 * @throws {Error} Relance l'erreur API si l'appel échoue.
 * @returns {Promise<object>} La réponse de l'API contenant le client nouvellement créé.
 */
const create = async (clientData) => {
  try {
    const response = await apiClient.post(API_ENDPOINTS.CLIENTS, clientData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la création du client :", error.response?.data || error.message);
    throw error;
  }
};

/**
 * Met à jour un client existant.
 * @param {string} id - L'ID du client à mettre à jour.
 * @param {object} updateData - Les champs à mettre à jour.
 * @throws {Error} Relance l'erreur API si l'appel échoue.
 * @returns {Promise<object>} La réponse de l'API contenant le client mis à jour.
 */
const update = async (id, updateData) => {
  try {
    const response = await apiClient.patch(`${API_ENDPOINTS.CLIENTS}/${id}`, updateData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour du client ${id} :`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Supprime (ou désactive) un client.
 * @param {string} id - L'ID du client à supprimer.
 * @throws {Error} Relance l'erreur API si l'appel échoue.
 * @returns {Promise<void>}
 */
const remove = async (id) => {
  try {
    // La réponse pour un DELETE réussi est souvent un statut 204 No Content, sans corps.
    await apiClient.delete(`${API_ENDPOINTS.CLIENTS}/${id}`);
  } catch (error) {
    console.error(`Erreur lors de la suppression du client ${id} :`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * [EXEMPLE D'EXTENSION] Récupère les statistiques d'un client spécifique.
 * @param {string} id - L'ID du client.
 * @throws {Error} Relance l'erreur API si l'appel échoue.
 * @returns {Promise<object>} Un objet contenant les statistiques (ex: CA total, factures impayées).
 */
const getClientStats = async (id) => {
  try {
    const response = await apiClient.get(`${API_ENDPOINTS.CLIENTS}/${id}/stats`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération des stats du client ${id} :`, error.response?.data || error.message);
    throw error;
  }
};


// On exporte un objet contenant toutes les fonctions du service.
const clientsService = {
  getAll,
  getById,
  create,
  update,
  remove,
  getClientStats, // On ajoute la nouvelle fonction à l'export
};

export default clientsService;