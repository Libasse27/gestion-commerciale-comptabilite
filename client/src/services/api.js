// ==============================================================================
//           Configuration Centrale du Client API avec Axios
//
// Ce module configure une instance unique d'Axios pour toutes les
// communications avec le backend.
//
// Il utilise des intercepteurs pour :
//   - Attacher automatiquement le token JWT à chaque requête.
//   - Gérer globalement les erreurs d'authentification (401) en
//     déconnectant l'utilisateur.
//
// La fonction `injectStore` résout le problème de dépendance circulaire
// entre ce module et le store Redux.
// ==============================================================================

import axios from 'axios';
import { logout } from '../store/slices/authSlice'; // L'action de déconnexion

// Une référence au store Redux qui sera injectée après sa création.
let store;

/**
 * Fonction d'injection pour éviter les dépendances circulaires.
 * Elle sera appelée une seule fois depuis `client/src/store/index.js`.
 * @param {import('@reduxjs/toolkit').Store} _store - L'instance du store Redux.
 */
export const injectStore = (_store) => {
  store = _store;
};

// Création de l'instance Axios de base
const apiClient = axios.create({
  // L'URL de base est définie dans les variables d'environnement Vite
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});


// --- Intercepteur de Requête ---
// S'exécute AVANT chaque requête envoyée.
apiClient.interceptors.request.use(
  (config) => {
    // Lire le token depuis l'état Redux est plus fiable que le localStorage,
    // car il représente l'état actuel de l'authentification.
    const token = store.getState().auth.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);


// --- Intercepteur de Réponse ---
// S'exécute APRÈS chaque réponse reçue (qu'elle soit réussie ou en erreur).
apiClient.interceptors.response.use(
  (response) => response, // Si la réponse est réussie, on la laisse passer.
  (error) => {
    // On vérifie si l'erreur est une erreur 401 (Non Autorisé)
    const isAuthError = error.response && error.response.status === 401;
    const originalRequest = error.config;

    // Éviter une boucle infinie de déconnexion si la requête de login elle-même échoue
    if (isAuthError && !originalRequest.url.includes('/auth/login')) {
      console.error("Erreur 401 : Token invalide ou expiré. Déconnexion de l'utilisateur...");
      
      // Utilise le store injecté pour dispatcher l'action de déconnexion.
      // Cela va nettoyer l'état de l'utilisateur et le rediriger vers la page de connexion.
      store.dispatch(logout());
    }

    // On propage l'erreur pour qu'elle puisse être gérée par le code qui
    // a initié l'appel (ex: dans un bloc try/catch ou un hook `useApi`).
    return Promise.reject(error);
  }
);

export default apiClient;