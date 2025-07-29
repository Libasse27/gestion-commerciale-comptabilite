// ==============================================================================
//                Modèle Mongoose pour les Permissions
//
// Ce modèle représente une permission unitaire et granulaire dans le système.
// C'est la brique de base du système de contrôle d'accès basé sur les rôles (RBAC).
//
// Exemples de permissions :
// - 'create:produit' -> Droit de créer un nouveau produit.
// - 'read:facture' -> Droit de consulter les factures.
// - 'update:client' -> Droit de modifier la fiche d'un client.
// - 'delete:user' -> Droit de supprimer un utilisateur (typiquement pour Admin).
//
// ==============================================================================

const mongoose = require('mongoose');

/**
 * Schéma pour une Permission.
 */
const permissionSchema = new mongoose.Schema(
  {
    /**
     * Le nom unique de la permission, suivant une convention claire.
     * Convention recommandée : 'action:ressource' (ex: 'create:produit').
     * L'option `unique: true` crée automatiquement un index unique sur ce champ.
     */
    name: {
      type: String,
      required: [true, 'Le nom de la permission est obligatoire.'],
      unique: true,
      trim: true,
      description: "Nom unique de la permission, ex: 'create:produit'",
    },

    /**
     * Une description lisible de ce que la permission autorise.
     * Utile pour l'affichage dans une interface d'administration des rôles.
     */
    description: {
      type: String,
      required: false,
      trim: true,
      description: 'Description de la permission',
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

/*
 * La déclaration manuelle de l'index ci-dessous a été supprimée car l'option
 * `unique: true` sur le champ 'name' s'en charge déjà.
 */
// permissionSchema.index({ name: 1 });

/**
 * Création du modèle 'Permission' à partir du schéma.
 */
const Permission = mongoose.model('Permission', permissionSchema);

module.exports = Permission;