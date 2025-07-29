// ==============================================================================
//           Service pour les Appels API du Tableau de Bord
//
// Ce service encapsule toutes les interactions avec les points de terminaison
// (endpoints) de l'API qui fournissent des données agrégées pour les
// tableaux de bord et les rapports.
//
// Chaque fonction correspond à une route spécifique du `statistiquesController`
// et utilise `apiClient` pour effectuer les requêtes.
// ==============================================================================

import apiClient from './api';

/**
 * Récupère les indicateurs de performance clés (KPIs) pour le tableau de bord principal.
 * @returns {Promise<object>} Un objet contenant les KPIs (chiffreAffairesAujourdhui, etc.).
 */
const getKpisCommerciaux = async () => {
  // Le token d'authentification et les permissions sont gérés par le backend.
  // L'intercepteur d'apiClient ajoutera le token automatiquement.
  const response = await apiClient.get('/statistiques/kpis-commerciaux');
  
  // L'API renvoie { status: 'success', data: { kpis: {...} } }
  // On retourne directement l'objet kpis pour simplifier l'utilisation dans le slice.
  return response.data.data.kpis;
};

/**
 * Récupère les données des ventes mensuelles sur les 12 derniers mois.
 * @returns {Promise<Array<object>>} Un tableau d'objets { date, chiffreAffaires }.
 */
const getVentesAnnuelles = async () => {
  const response = await apiClient.get('/statistiques/ventes-annuelles');
  // L'API renvoie { status: 'success', data: { ventesMensuelles: [...] } }
  return response.data.data.ventesMensuelles;
};

/**
 * Récupère le top 5 des clients par chiffre d'affaires.
 * @returns {Promise<Array<object>>} Un tableau d'objets { client, ca }.
 */
const getTopClients = async () => {
    // Supposons que vous ayez une route /statistiques/top-clients
    // const response = await apiClient.get('/statistiques/top-clients');
    // return response.data.data.topClients;
    
    // Pour l'instant, retournons des données factices
    return [
        { client: 'Client A', ca: 5800000 },
        { client: 'Client B', ca: 4500000 },
        { client: 'Client C', ca: 3200000 },
    ];
};

// On exporte un objet contenant toutes les fonctions du service
const dashboardService = {
  getKpisCommerciaux,
  getVentesAnnuelles,
  getTopClients,
};

export default dashboardService;