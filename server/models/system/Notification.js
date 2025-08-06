// server/models/system/Notification.js
// ==============================================================================
//           Modèle Mongoose pour les Notifications Utilisateur
//
// Ce modèle enregistre les notifications destinées à des utilisateurs
// spécifiques au sein de l'application.
//
// Il permet de gérer un centre de notifications, d'envoyer des alertes en
// temps réel via Socket.IO, et de conserver un historique des communications.
// ==============================================================================

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    /**
     * L'utilisateur qui doit recevoir la notification.
     */
    destinataire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    
    /**
     * Le type de notification, pour un affichage ou un traitement différent sur le frontend.
     */
    type: {
        type: String,
        required: true,
        enum: [
            'info',         // Information générale
            'success',      // Action réussie
            'warning',      // Avertissement (ex: stock bas)
            'error',        // Erreur système
            'assignation',  // Une tâche ou un document vous a été assigné
        ],
        default: 'info',
    },

    /**
     * Le message de la notification.
     */
    message: {
        type: String,
        required: true,
        trim: true,
    },

    /**
     * Le statut de la notification, pour la gestion de l'affichage dans l'UI.
     */
    statut: {
        type: String,
        enum: ['Non lue', 'Lue'],
        default: 'Non lue',
    },
    
    dateLecture: {
        type: Date,
    },
    
    /**
     * (Optionnel) Un lien relatif vers la ressource concernée par la notification.
     * Ex: '/ventes/factures/60b8d295f1d2b0e6d8c3e4a5'
     */
    lien: {
        type: String,
        trim: true,
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Seul createdAt est pertinent
    collection: 'system_notifications',
  }
);


// Index optimisé pour la requête la plus fréquente :
// "Trouver les notifications non lues d'un utilisateur, triées par date".
notificationSchema.index({ destinataire: 1, statut: 1, createdAt: -1 });


const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);

module.exports = Notification;