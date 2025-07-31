// ==============================================================================
//                Modèle Mongoose pour les Permissions
//
// Ce modèle définit une permission unitaire au sein de l'application. Une
// permission représente une action unique et granulaire, comme "créer un client",
// "lire une facture", ou "supprimer un utilisateur".
//
// Les permissions sont ensuite regroupées et assignées à des Rôles pour
// définir les droits d'accès.
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Schéma pour une Permission.
 */
const permissionSchema = new mongoose.Schema(
  {
    /**
     * Le nom unique de la permission, suivant une convention claire.
     * Convention recommandée : "sujet:action" (ex: "client:create", "facture:read").
     */
    name: {
      type: String,
      required: [true, 'Le nom de la permission est obligatoire.'],
      unique: true,
      trim: true,
      match: [
        /^[a-z_]+:[a-z_]+$/,
        'Le format de la permission doit être "sujet:action" (ex: client:create)',
      ],
      description: 'Identifiant unique de la permission (ex: "client:create")',
    },

    /**
     * Une description lisible de ce que la permission autorise.
     */
    description: {
      type: String,
      trim: true,
      required: false,
      description: 'Description de ce que la permission permet de faire',
    },

    /**
     * Un champ de groupement pour organiser les permissions dans l'interface utilisateur.
     */
    group: {
      type: String,
      required: [true, "Le groupe de la permission est obligatoire."],
      trim: true,
      description: 'Module de regroupement pour l\'UI (ex: "Clients")',
    },
  },
  {
    /**
     * Options du schéma :
     * - timestamps: ajoute automatiquement les champs `createdAt` et `updatedAt`.
     */
    timestamps: true,
    collection: 'auth_permissions', // Nom explicite pour la collection dans la DB
  }
);

/**
 * Création d'un index sur le champ 'group' pour optimiser les requêtes
 * qui cherchent à regrouper les permissions par catégorie.
 */
permissionSchema.index({ group: 1 });

/**
 * ✅ MISE À JOUR APPLIQUÉE
 * On vérifie si le modèle 'Permission' a déjà été compilé avant de le créer.
 * Cela évite l'erreur "OverwriteModelError" lors du rechargement à chaud (hot-reload),
 * rendant le code plus robuste en environnement de développement.
 */
const Permission = mongoose.models.Permission || mongoose.model('Permission', permissionSchema);

module.exports = Permission;