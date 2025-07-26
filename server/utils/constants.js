// ==============================================================================
//                     CONSTANTES GLOBALES DE L'APPLICATION
//
// Ce fichier centralise toutes les valeurs constantes utilisées dans l'application
// backend. L'utilisation de ce fichier permet de :
//   - Éviter les chaînes de caractères "magiques" et les fautes de frappe.
//   - Faciliter la maintenance et les mises à jour.
//   - Avoir une source unique de vérité pour les valeurs métier critiques.
//
// Object.freeze() est utilisé pour rendre les objets immuables et prévenir
// toute modification accidentelle au cours de l'exécution.
// ==============================================================================

/**
 * Rôles des utilisateurs pour le contrôle d'accès (RBAC).
 */
const USER_ROLES = Object.freeze({
  ADMIN: 'Admin',
  COMPTABLE: 'Comptable',
  COMMERCIAL: 'Commercial',
  VENDEUR: 'Vendeur',
});

/**
 * Statuts possibles pour les documents du cycle de vente.
 */
const DOCUMENT_STATUS = Object.freeze({
  // Statuts pour Devis et Commandes
  BROUILLON: 'brouillon',
  ENVOYE: 'envoyee',
  VALIDE: 'validee', // ou 'acceptée' pour un devis
  REFUSE: 'refusee',
  ANNULE: 'annulee',

  // Statuts spécifiques aux Factures
  PAYEE: 'payee',
  PARTIELLEMENT_PAYEE: 'partiellement_payee',
  EN_RETARD: 'en_retard',

  // Statuts spécifiques aux Livraisons
  EN_PREPARATION: 'en_preparation',
  PRETE_POUR_LIVRAISON: 'prete_pour_livraison',
  LIVREE: 'livree',
});

/**
 * Types de mouvements de stock.
 */
const STOCK_MOVEMENT_TYPES = Object.freeze({
  ENTREE_ACHAT: 'entree_achat',       // Achat auprès d'un fournisseur
  SORTIE_VENTE: 'sortie_vente',       // Vente à un client
  RETOUR_CLIENT: 'retour_client',       // Un client retourne un produit
  RETOUR_FOURNISSEUR: 'retour_fournisseur', // Retour d'un produit à un fournisseur
  AJUSTEMENT_POSITIF: 'ajustement_positif', // Inventaire, correction d'erreur
  AJUSTEMENT_NEGATIF: 'ajustement_negatif', // Perte, casse, vol
  TRANSFERT_ENTRANT: 'transfert_entrant', // Transfert entre dépôts
  TRANSFERT_SORTANT: 'transfert_sortant',   // Transfert entre dépôts
});

/**
 * Modes de paiement acceptés.
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
 * Constantes fiscales et comptables.
 */
const FISCAL_CONSTANTS = Object.freeze({
  // Taux de TVA standard au Sénégal
  TVA_RATE_SENEGAL: 18,
});

/**
 * Paramètres par défaut pour la pagination.
 */
const PAGINATION_DEFAULTS = Object.freeze({
  PAGE: 1,
  LIMIT: 20,
});

/**
 * Actions enregistrées dans le journal d'audit.
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
 * Durée d'expiration par défaut pour le cache Redis (en secondes).
 */
const CACHE_TTL = Object.freeze({
  SHORT: 60,       // 1 minute
  MEDIUM: 600,     // 10 minutes
  LONG: 3600,      // 1 heure
});


module.exports = {
  USER_ROLES,
  DOCUMENT_STATUS,
  STOCK_MOVEMENT_TYPES,
  PAYMENT_METHODS,
  FISCAL_CONSTANTS,
  PAGINATION_DEFAULTS,
  AUDIT_LOG_ACTIONS,
  CACHE_TTL,
};