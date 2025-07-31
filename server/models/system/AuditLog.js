// ==============================================================================
//           Modèle Mongoose pour le Journal d'Audit
//
// Ce modèle enregistre les actions importantes effectuées par les utilisateurs
// dans l'application à des fins de sécurité, de traçabilité et d'audit.
//
// Il est conçu pour être une piste d'audit fiable, enregistrant qui a
// effectué une action, quelle était l'action, sur quelle ressource,
// et quel était le résultat.
// ==============================================================================

const mongoose = require('mongoose');
const { AUDIT_LOG_ACTIONS } = require('../../utils/constants');

const auditLogSchema = new mongoose.Schema(
  {
    /**
     * L'utilisateur qui a effectué l'action.
     * Peut être null pour les actions système (ex: tentative de connexion échouée).
     */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    
    /**
     * Le type d'action effectuée.
     * Utilise une énumération pour la cohérence des données.
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
     * Un champ pour stocker des détails supplémentaires.
     * Pour une action 'UPDATE', on pourrait stocker ici les changements
     * (avant/après) sous forme de JSON. Pour une erreur, le message d'erreur.
     */
    details: {
      type: mongoose.Schema.Types.Mixed,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Seul `createdAt` est pertinent
    collection: 'system_auditlogs',
  }
);


// Index pour accélérer la recherche par utilisateur, action ou entité
auditLogSchema.index({ user: 1, createdAt: -1 });
auditLogSchema.index({ entity: 1, entityId: 1, createdAt: -1 });


/**
 * On vérifie si le modèle a déjà été compilé avant de le créer pour éviter
 * les erreurs lors du rechargement à chaud en développement.
 */
const AuditLog = mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;