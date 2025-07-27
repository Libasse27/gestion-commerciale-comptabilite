// ==============================================================================
//                Configuration Centrale du Client API (Axios)
//
// Ce fichier configure et exporte une instance d'Axios qui sera utilisée pour
// toutes les requêtes HTTP vers le backend.
//
// Avantages :
//   - Utilise un chemin relatif pour la baseURL, ce qui permet au proxy de Vite
//     de fonctionner en développement, tout en étant compatible avec une
//     configuration de reverse proxy en production.
//   - Injection automatique du token JWT d'authentification dans les requêtes.
//   - Gestion centralisée des réponses et des erreurs.
// ==============================================================================

import axios from 'axios';
import { LOCAL_STORAGE_KEYS } from '../utils/constants';

/**
 * Crée une instance d'Axios avec une configuration par défaut.
 */
const apiClient = axios.create({
  // CHANGEMENT CLÉ :
  // On utilise un chemin relatif. En développement, le proxy de Vite (configuré dans
  // vite.config.js) interceptera les requêtes commençant par '/api' et les
  // redirigera vers notre backend.
  // En production, cette configuration fonctionnera parfaitement derrière un
  // reverse proxy (comme Nginx) qui redirigera aussi les requêtes /api.
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Intercepteur de Requête (Request Interceptor)
 *
 * Exécuté AVANT chaque requête pour y attacher le token JWT.
 */
apiClient.interceptors.request.use(
  (config) => {
    // Récupérer le token depuis le localStorage.
    // NOTE : Une meilleure approche serait de stocker le token dans la mémoire
    // du store Redux et de ne lire le localStorage qu'à l'initialisation.
    const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Intercepteur de Réponse (Response Interceptor)
 *
 * Exécuté APRÈS chaque réponse pour une gestion globale des erreurs.
 */
apiClient.interceptors.response.use(
  (response) => {
    // Si la réponse est réussie, on la retourne.
    return response;
  },
  (error) => {
    // Si une réponse d'erreur a été reçue (4xx, 5xx)
    if (error.response) {
      // Gérer spécifiquement l'erreur 401 (Non autorisé)
      if (error.response.status === 401) {
        // Déclencher une déconnexion globale si l'erreur n'est pas sur une
        // tentative de connexion (pour éviter les boucles).
        if (!error.config.url.includes('/auth/login')) {
          console.error("Erreur 401 : Token invalide ou expiré. Déconnexion requise.");
          // TODO: Dispatch une action Redux pour déconnecter l'utilisateur proprement
          // store.dispatch(logout());
        }
      }
    }
    
    // Renvoyer l'erreur pour qu'elle puisse être traitée localement (par un .catch).
    return Promise.reject(error);
  }
);

export default apiClient;