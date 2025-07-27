// ==============================================================================
//                     CONSTANTES GLOBALES DE L'APPLICATION CLIENT
//
// Ce fichier centralise toutes les valeurs constantes utilisées dans l'application
// frontend. L'utilisation de ce fichier permet de :
//   - Éviter les chaînes de caractères "magiques" et les fautes de frappe.
//   - Faciliter la maintenance et les mises à jour.
//   - Avoir une source unique de vérité pour les valeurs critiques côté client.
// ==============================================================================

/**
 * Clés utilisées pour le stockage local (localStorage).
 * Utiliser des constantes évite les fautes de frappe lors de l'accès au localStorage.
 */
export const LOCAL_STORAGE_KEYS = Object.freeze({
  AUTH_TOKEN: 'erp_auth_token',
  REFRESH_TOKEN: 'erp_refresh_token',
  USER_INFO: 'erp_user_info',
  UI_THEME: 'erp_ui_theme', // Pour le thème sombre/clair
});

/**
 * Points de terminaison (endpoints) de l'API.
 * Centraliser les routes de l'API ici facilite leur mise à jour si le backend change.
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
  // ... ajouter les autres endpoints au fur et à mesure
});

/**
 * Constantes pour la configuration de l'interface utilisateur.
 */
export const UI_SETTINGS = Object.freeze({
  DEFAULT_DEBOUNCE_DELAY: 500, // en ms
  ITEMS_PER_PAGE: 10, // Nombre d'éléments par page pour la pagination
  TOAST_DEFAULT_DURATION: 3000, // Durée d'affichage des notifications (toasts)
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
 * Noms des slices Redux, utiles pour éviter les fautes de frappe.
 */
export const REDUX_SLICE_NAMES = Object.freeze({
  AUTH: 'auth',
  UI: 'ui',
  CLIENTS: 'clients',
  PRODUITS: 'produits',
  // ... etc.
});