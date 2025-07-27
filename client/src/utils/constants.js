// ==============================================================================
//                     CONSTANTES GLOBALES DE L'APPLICATION CLIENT
//
// ... (description inchangée)
// ==============================================================================

/**
 * Rôles des utilisateurs.
 * Doit être synchronisé avec les rôles définis dans `server/utils/constants.js`.
 */
export const USER_ROLES = Object.freeze({
  ADMIN: 'Admin',
  COMPTABLE: 'Comptable',
  COMMERCIAL: 'Commercial',
  VENDEUR: 'Vendeur',
});

/**
 * Clés utilisées pour le stockage local (localStorage).
 */
export const LOCAL_STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'erp_auth_token',
  REFRESH_TOKEN: 'erp_refresh_token',
  USER_INFO: 'erp_user_info',
  UI_THEME: 'erp_ui_theme',
});

/**
 * Points de terminaison (endpoints) de l'API.
 */
export const API_ENDPOINTS = Object.freeze({
  // Authentification
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  REFRESH_TOKEN: '/auth/refresh-token',
  REQUEST_PASSWORD_RESET: '/auth/request-password-reset',

  // Ressources
  USERS: '/users',
  CLIENTS: '/clients',
  FOURNISSEURS: '/fournisseurs',
  PRODUITS: '/produits',
  FACTURES: '/factures',
  DEVIS: '/devis',
});

/**
 * Constantes pour la configuration de l'interface utilisateur.
 */
export const UI_SETTINGS = Object.freeze({
  DEFAULT_DEBOUNCE_DELAY: 500,
  ITEMS_PER_PAGE: 10,
  TOAST_DEFAULT_DURATION: 3000,
});

/**
 * Types d'événements pour les notifications (Toast).
 */
export const TOAST_TYPES = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
});

/**
 * Noms des slices Redux.
 */
export const REDUX_SLICE_NAMES = Object.freeze({
  AUTH: 'auth',
  UI: 'ui',
  CLIENTS: 'clients',
  PRODUITS: 'produits',
});