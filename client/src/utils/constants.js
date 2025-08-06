// client/src/utils/constants.js
export const USER_ROLES = Object.freeze({
  ADMIN: 'Admin',
  COMPTABLE: 'Comptable',
  COMMERCIAL: 'Commercial',
  VENDEUR: 'Vendeur',
});

export const LOCAL_STORAGE_KEYS = Object.freeze({
  USER_INFO: 'erp:user_info',
  ACCESS_TOKEN: 'erp:access_token',
  UI_THEME: 'erp:ui_theme',
});

export const API_ENDPOINTS = Object.freeze({
  // --- Auth & Users ---
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  UPDATE_MY_PASSWORD: '/auth/update-my-password',
  
  USERS: '/users',
  USERS_ME: '/users/me',
  UPDATE_ME: '/users/updateMe',

  ROLES: '/roles',
  PERMISSIONS: '/roles/permissions',
  
  // --- Commercial ---
  CLIENTS: '/clients',
  FOURNISSEURS: '/fournisseurs',
  PRODUITS: '/produits',
  CATEGORIES: '/produits/categories/all',

  // --- Ventes ---
  VENTES: '/ventes',
  DEVIS: '/ventes/devis',
  COMMANDES: '/ventes/commandes',
  FACTURES: '/ventes/factures',
  BON_LIVRAISONS: '/ventes/bon-livraisons',
  
  // --- ACHATS ---
  ACHATS: '/achats',
  FACTURES_ACHAT: '/achats/factures',

  // --- Stock ---
  STOCK: '/stock',
  DEPOTS: '/stock/depots',
  INVENTAIRES: '/stock/inventaires',
  MOUVEMENTS: '/stock/mouvements',
  ALERTES: '/stock/alertes',

  // --- Paiements ---
  PAIEMENTS: '/paiements',
  ENCAISSEMENTS: '/paiements/encaissements',
  DECAISSEMENTS: '/paiements/decaissements',
  ECHEANCIERS: '/paiements/echeanciers',
  RELANCES: '/paiements/relances',
  MOBILE_MONEY_INITIATE: '/paiements/mobile-money/initiate-wave',

  // --- Comptabilité ---
  COMPTABILITE: '/comptabilite',
  PLAN_COMPTABLE: '/comptabilite/plan-comptable',
  ECRITURES: '/comptabilite/ecritures',
  GRAND_LIVRE: '/comptabilite/grand-livre',

  // --- Rapports & Dashboard ---
  DASHBOARD: '/dashboard',
  RAPPORTS: '/dashboard/rapports',
  RAPPORT_VENTES: '/dashboard/rapports/ventes',
  RAPPORT_BALANCE: '/dashboard/rapports/balance-generale',
  RAPPORT_BILAN: '/dashboard/rapports/bilan',
  RAPPORT_TVA: '/dashboard/rapports/declaration-tva',
  STATISTIQUES: '/statistiques', // Maintenu pour la compatibilité

  // --- Système ---
  PARAMETRES: '/system/parametres',
  AUDIT_LOGS: '/system/audit-logs',
  NOTIFICATIONS: '/system/notifications',
  BACKUPS: '/system/backups',
});

export const UI_SETTINGS = Object.freeze({
  DEFAULT_DEBOUNCE_DELAY: 500,
  ITEMS_PER_PAGE: 15,
  TOAST_DEFAULT_DURATION: 4000,
});

export const TOAST_TYPES = Object.freeze({
  SUCCESS: 'success',
  ERROR: 'error',
  INFO: 'info',
  WARNING: 'warning',
});

export const REDUX_SLICE_NAMES = Object.freeze({
  AUTH: 'auth',
  UI: 'ui',
  DASHBOARD: 'dashboard',
  CLIENTS: 'clients',
  FOURNISSEURS: 'fournisseurs',
  PRODUITS: 'produits',
  CATEGORIES: 'categories',
  FACTURES: 'factures',
  PARAMETRES: 'parametres',
  USERS: 'users',
  ROLES: 'roles',
  NOTIFICATIONS: 'notifications',
  STOCK: 'stock',
  COMPTABILITE: 'comptabilite',
});