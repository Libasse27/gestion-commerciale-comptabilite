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
     * Le type de notification, pour un affichage ou un traitement différent.
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
     * Le statut de la notification.
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
     * (Optionnel) Un lien vers la ressource concernée par la notification.
     * Ex: Un lien direct vers la facture qui vient d'être créée.
     */
    lien: {
        type: String,
        trim: true,
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'system_notifications',
  }
);


// Index pour récupérer rapidement les notifications non lues d'un utilisateur
notificationSchema.index({ destinataire: 1, statut: 1, createdAt: -1 });


const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;