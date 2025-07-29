// ==============================================================================
//                Modèle Mongoose pour les Rôles Utilisateur
//
// Ce modèle définit un rôle au sein de l'application. Un rôle est un ensemble
// de permissions qui peut être assigné à un ou plusieurs utilisateurs.
//
// C'est le cœur du système de contrôle d'accès basé sur les rôles (RBAC).
// Un utilisateur se voit attribuer un rôle, et ce rôle définit ses droits.
// ==============================================================================

const mongoose = require('mongoose');
const { USER_ROLES } = require('../../utils/constants');

/**
 * Schéma pour un Rôle.
 */
const roleSchema = new mongoose.Schema(
  {
    /**
     * Le nom unique du rôle.
     * Contraint par une énumération définie dans les constantes de l'application
     * pour garantir la cohérence.
     * L'option `unique: true` crée automatiquement un index unique sur ce champ.
     */
    name: {
      type: String,
      required: [true, 'Le nom du rôle est obligatoire.'],
      unique: true,
      enum: {
        values: Object.values(USER_ROLES),
        message: 'La valeur {VALUE} n\'est pas un rôle supporté.',
      },
      description: 'Nom unique du rôle (Admin, Comptable, etc.)',
    },

    /**
     * Une description lisible du rôle et de ses responsabilités.
     */
    description: {
      type: String,
      trim: true,
      required: false,
      description: 'Description des responsabilités du rôle',
    },

    /**
     * Un tableau de références vers les documents 'Permission'.
     * C'est ici que l'on définit ce que le rôle a le droit de faire.
     */
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission', // Fait le lien avec le modèle Permission
      },
    ],
  },
  {
    /**
     * Options du schéma :
     * - timestamps: ajoute automatiquement les champs `createdAt` et `updatedAt`.
     */
    timestamps: true,
    collection: 'auth_roles', // Nom explicite pour la collection dans la DB
  }
);

/*
 * La déclaration manuelle de l'index ci-dessous a été supprimée car l'option
 * `unique: true` sur le champ 'name' s'en charge déjà.
 */
// roleSchema.index({ name: 1 });

/**
 * Création du modèle 'Role' à partir du schéma.
 */
const Role = mongoose.model('Role', roleSchema);

module.exports = Role;