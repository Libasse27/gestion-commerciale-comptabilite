// ==============================================================================
//                     CONSTANTES GLOBALES DE L'APPLICATION
//
// Ce fichier centralise toutes les valeurs constantes utilisées dans l'application
// backend. L'utilisation de ce fichier permet de :
//   - Éviter les chaînes de caractères "magiques" et les fautes de frappe.
//   - Faciliter la maintenance et les mises à jour.
//   - Avoir une source unique de vérité pour les valeurs métier critiques.
// ==============================================================================

/**
 * Rôles des utilisateurs pour le contrôle d'accès (RBAC)
 */
const USER_ROLES = Object.freeze({
  ADMIN: 'Admin',
  COMPTABLE: 'Comptable',
  COMMERCIAL: 'Commercial',
  VENDEUR: 'Vendeur',
});

/**
 * Statuts possibles pour les documents du cycle de vente
 */
const DOCUMENT_STATUS = Object.freeze({
  // Devis et Commandes
  BROUILLON: 'brouillon',
  ENVOYE: 'envoyee',
  VALIDE: 'validee',
  REFUSE: 'refusee',
  ANNULE: 'annulee',

  // Factures
  PAYEE: 'payee',
  PARTIELLEMENT_PAYEE: 'partiellement_payee',
  EN_RETARD: 'en_retard',

  // Livraisons
  EN_PREPARATION: 'en_preparation',
  PRETE_POUR_LIVRAISON: 'prete_pour_livraison',
  LIVREE: 'livree',
});

/**
 * Types de documents métiers
 */
const DOCUMENT_TYPES = Object.freeze({
  DEVIS: 'devis',
  COMMANDE: 'commande',
  FACTURE: 'facture',
  BON_LIVRAISON: 'bon_livraison',
  AVOIR: 'avoir',
});

/**
 * Types de mouvements de stock
 */
const STOCK_MOVEMENT_TYPES = Object.freeze({
  ENTREE_ACHAT: 'entree_achat',
  SORTIE_VENTE: 'sortie_vente',
  RETOUR_CLIENT: 'retour_client',
  RETOUR_FOURNISSEUR: 'retour_fournisseur',
  AJUSTEMENT_POSITIF: 'ajustement_positif',
  AJUSTEMENT_NEGATIF: 'ajustement_negatif',
  TRANSFERT_ENTRANT: 'transfert_entrant',
  TRANSFERT_SORTANT: 'transfert_sortant',
});

/**
 * Modes de paiement disponibles, en particulier pour le Sénégal
 */
const PAYMENT_METHODS = Object.freeze({
  ESPECES: 'Espèces',
  CHEQUE: 'Chèque',
  VIREMENT_BANCAIRE: 'Virement Bancaire',
  ORANGE_MONEY: 'Orange Money',
  WAVE: 'Wave',
  AUTRE: 'Autre',
});

/**
 * Constantes fiscales et comptables spécifiques au Sénégal
 */
const FISCAL_CONSTANTS = Object.freeze({
  TVA_RATE_SENEGAL: 18,
  DEVISE_PAR_DEFAUT: 'XOF', // Franc CFA
});

/**
 * Paramètres de pagination par défaut pour les API
 */
const PAGINATION_DEFAULTS = Object.freeze({
  PAGE: 1,
  LIMIT: 20,
});

/**
 * Actions possibles dans le journal d’audit pour la traçabilité
 */
const AUDIT_LOG_ACTIONS = Object.freeze({
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  EXPORT: 'EXPORT',
  PASSWORD_RESET_REQUEST: 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS: 'PASSWORD_RESET_SUCCESS',
});

/**
 * Durées d’expiration du cache (en secondes) pour Redis
 */
const CACHE_TTL = Object.freeze({
  SHORT: 60,       // 1 minute
  MEDIUM: 600,     // 10 minutes
  LONG: 3600,      // 1 heure
});

/**
 * Identifiants pour les modèles d'emails (templates)
 */
const EMAIL_TEMPLATES = Object.freeze({
  WELCOME: 'welcome_email',
  PASSWORD_RESET: 'password_reset',
  FACTURE_ENVOYEE: 'facture_envoyee',
  DEVIS_ENVOYE: 'devis_envoye',
});

/**
 * Formats de dates standards utilisés dans l'application
 */
const DATE_FORMATS = Object.freeze({
  SHORT: 'DD/MM/YYYY',
  LONG: 'DD/MM/YYYY HH:mm',
});

module.exports = {
  USER_ROLES,
  DOCUMENT_STATUS,
  DOCUMENT_TYPES,
  STOCK_MOVEMENT_TYPES,
  PAYMENT_METHODS,
  FISCAL_CONSTANTS,
  PAGINATION_DEFAULTS,
  AUDIT_LOG_ACTIONS,
  CACHE_TTL,
  EMAIL_TEMPLATES,
  DATE_FORMATS,
};