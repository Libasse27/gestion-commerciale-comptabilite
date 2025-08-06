// server/models/system/AuditLog.js
// ==============================================================================
//           Modèle Mongoose pour le Journal d'Audit
//
// Ce modèle enregistre les actions importantes effectuées par les utilisateurs
// à des fins de sécurité et de traçabilité.
//
// OPTIMISATION : Ce schéma est configuré pour utiliser une "Capped Collection"
// afin de gérer automatiquement la taille des logs et de garantir des
// performances d'écriture élevées.
// ==============================================================================

const mongoose = require('mongoose');
const { AUDIT_LOG_ACTIONS } = require('../../utils/constants');

const auditLogSchema = new mongoose.Schema(
  {
    /**
     * L'utilisateur qui a effectué l'action.
     * Peut être null pour les actions système.
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    
    /**
     * Le type d'action effectuée.
     */
    action: {
        type: String,
        required: true,
        enum: Object.values(AUDIT_LOG_ACTIONS),
    },

    /**
     * L'entité ou la ressource qui a été affectée.
     * Ex: 'Client', 'Facture', 'User', 'System'
     */
    entity: {
        type: String,
        required: true,
    },
    
    /**
     * L'ID spécifique de l'entité affectée, si applicable.
     */
    entityId: {
        type: mongoose.Schema.Types.ObjectId,
    },

    /**
     * Le statut de l'opération (succès ou échec).
     */
    status: {
        type: String,
        enum: ['SUCCESS', 'FAILURE'],
        required: true,
    },

    /**
     * L'adresse IP de l'utilisateur au moment de l'action.
     */
    ipAddress: {
        type: String,
    },

    /**
     * Un champ pour stocker des détails supplémentaires (différences de données, message d'erreur).
     */
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    // --- Configuration pour une Capped Collection ---
    // `capped` définit la taille maximale de la collection en octets (bytes).
    // Ici, environ 50 Mo. Lorsque cette taille est atteinte, les plus anciens
    // documents sont automatiquement supprimés.
    capped: { size: 52428800, max: 50000 },
    
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'system_auditlogs',
  }
);

// Index pour accélérer la recherche par utilisateur, action ou entité
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });


const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;