// server/models/auth/Permission.js
const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Le nom de la permission est obligatoire.'],
      unique: true,
      trim: true,
      // === RÉINTRODUCTION DE LA REGEX FLEXIBLE ===
      match: [
        /^[a-z_]+(:[a-z_]+)+$/,
        'Le format de la permission doit être "sujet:action" ou "sujet:action:scope" (ex: client:create)',
      ],
      description: 'Identifiant unique de la permission (ex: "client:create")',
    },
    // ... (reste du fichier identique)
    description: {
      type: String,
      trim: true,
      required: false,
    },
    group: {
      type: String,
      required: [true, "Le groupe de la permission est obligatoire."],
      trim: true,
    },
  },
  {
    timestamps: true,
    collection: 'auth_permissions',
  }
);

permissionSchema.index({ group: 1 });

const Permission = mongoose.models.Permission || mongoose.model('Permission', permissionSchema);

module.exports = Permission;