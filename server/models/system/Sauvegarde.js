// server/models/system/Sauvegarde.js
// ==============================================================================
//           Modèle Mongoose pour le Journal des Sauvegardes
//
// Ce modèle enregistre les métadonnées de chaque opération de sauvegarde
// (backup) de la base de données.
//
// Il ne contient pas les données de la sauvegarde elles-mêmes, mais plutôt
// des informations sur l'opération : quand elle a eu lieu, si elle a réussi,
// et où le fichier de sauvegarde est stocké.
// ==============================================================================

const mongoose = require('mongoose');

const sauvegardeSchema = new mongoose.Schema(
  {
    /**
     * Le nom du fichier de sauvegarde généré.
     * Ex: 'backup-2024-07-29T10-30-00.gz'
     */
    nomFichier: {
      type: String,
      required: true,
      unique: true,
    },

    /**
     * Le type de sauvegarde.
     */
    type: {
        type: String,
        enum: ['Automatique', 'Manuelle'],
        required: true,
    },
    
    /**
     * Le statut final de l'opération de sauvegarde.
     */
    statut: {
        type: String,
        enum: ['Réussie', 'Échouée'],
        required: true,
    },
    
    /**
     * La taille du fichier de sauvegarde en bytes.
     */
    taille: {
        type: Number, // en bytes
        default: 0,
    },
    
    /**
     * L'emplacement de stockage du fichier de sauvegarde.
     * Ex: 'local', 'aws_s3', 'google_cloud_storage'
     */
    emplacement: {
        type: String,
        default: 'local'
    },
    
    /**
     * Le chemin d'accès complet au fichier de sauvegarde.
     */
    chemin: {
        type: String,
        required: true,
    },

    /**
     * L'utilisateur qui a initié la sauvegarde (pour les manuelles).
     */
    initiateur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    /**
     * Un champ pour stocker le message d'erreur en cas d'échec.
     */
    messageErreur: {
        type: String,
        trim: true,
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    collection: 'system_sauvegardes',
  }
);

sauvegardeSchema.index({ createdAt: -1 });

const Sauvegarde = mongoose.models.Sauvegarde || mongoose.model('Sauvegarde', sauvegardeSchema);

module.exports = Sauvegarde;