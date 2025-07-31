// ==============================================================================
//                     CONSTANTES GLOBALES DE L'APPLICATION CLIENT
//
// Ce fichier centralise toutes les valeurs constantes utilisées dans l'application
// frontend. L'utilisation de ce fichier permet de :
//   - Éviter les chaînes de caractères "magiques" et les fautes de frappe.
//   - Faciliter la maintenance et les mises à jour.
//   - Avoir une source unique de vérité pour les valeurs critiques.
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
 * Utiliser un préfixe permet d'éviter les collisions avec d'autres applications.
 */
export const LOCAL_STORAGE_KEYS = Object.freeze({
  USER_INFO: 'erp:user_info',
  UI_THEME: 'erp:ui_theme',
});

/**
 * Points de terminaison (endpoints) de l'API.
 * Note : La base de l'URL (ex: http://localhost:5000/api/v1) est
 * définie dans le client Axios. Ceci ne contient que les chemins relatifs.
 */
export const API_ENDPOINTS = Object.freeze({
  // Authentification
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password', // :token sera ajouté

  // Utilisateurs & Rôles
  USERS: '/users',
  ROLES: '/roles',
  USERS_ME: '/users/me',
  UPDATE_ME: '/users/updateMe',
  
  // Tiers
  CLIENTS: '/clients',
  FOURNISSEURS: '/fournisseurs',

  // Produits & Stock
  PRODUITS: '/produits',
  CATEGORIES: '/produits/categories',
  STOCK: '/stock',
  
  // Ventes
  DEVIS: '/ventes/devis',
  COMMANDES: '/ventes/commandes',
  FACTURES: '/ventes/factures',

  // Dashboard & Rapports
  DASHBOARD_KPIS: '/dashboard/kpis',
});

/**
 * Constantes pour la configuration de l'interface utilisateur.
 */
export const UI_SETTINGS = Object.freeze({
  DEFAULT_DEBOUNCE_DELAY: 500, // ms
  ITEMS_PER_PAGE: 10,
  TOAST_DEFAULT_DURATION: 4000, // ms
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
 * Noms des slices Redux pour une référence centralisée.
 */
export const REDUX_SLICE_NAMES = Object.freeze({
  AUTH: 'auth',
  UI: 'ui',
  DASHBOARD: 'dashboard',
  CLIENTS: 'clients',
  PRODUITS: 'produits',
  FACTURES: 'factures',
});