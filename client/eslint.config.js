// ==============================================================================
//           Configuration ESLint (Format "Flat Config")
//
// Ce fichier configure ESLint pour notre projet React + Vite.
// Il assure la qualité du code, la cohérence du style et le respect des
// bonnes pratiques pour React, les Hooks et l'accessibilité.
// ==============================================================================

import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";
import pluginJsxA11y from "eslint-plugin-jsx-a11y";

export default [
  // --- Fichiers et dossiers à ignorer ---
  {
    ignores: ["node_modules/", "build/", "dist/"],
  },

  // --- Configurations de Base ---
  // Applique les règles recommandées par ESLint
  pluginJs.configs.recommended,
  // Applique les règles d'accessibilité recommandées
  pluginJsxA11y.configs.recommended,

  // --- Configuration Spécifique aux Fichiers React (.js, .jsx) ---
  {
    files: ["src/**/*.{js,jsx}"],
    plugins: {
      react: pluginReact,
      'react-hooks': pluginReactHooks,
      'react-refresh': pluginReactRefresh,
    },
    languageOptions: {
      // Permet de parser le JSX
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      // Définit les variables globales disponibles (ex: `window`, `document`)
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: {
        // Détecte automatiquement la version de React que vous utilisez
        version: "detect",
      },
    },
    rules: {
      // Applique les règles recommandées pour React
      ...pluginReact.configs.recommended.rules,
      // Applique les règles recommandées pour les Hooks
      ...pluginReactHooks.configs.recommended.rules,
      
      // --- Règles pour React 17+ et Vite ---
      // Ces règles ne sont plus nécessaires avec le nouveau JSX Transform
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",

      // Règle spécifique à Vite pour le Fast Refresh
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // --- Personnalisation des Règles ---
      // Vous pouvez surcharger ou ajouter des règles ici
      
      // Mettre en warning plutôt qu'en erreur si une prop n'est pas typée
      // (utile dans un projet JS, peut être mis en "error" pour plus de rigueur)
      "react/prop-types": "warn",
      
      // Avertir pour les variables non utilisées au lieu de bloquer
      "no-unused-vars": "warn",
      
      // Exemple : forcer les guillemets simples
      "quotes": ["warn", "single"],
    },
  },
];