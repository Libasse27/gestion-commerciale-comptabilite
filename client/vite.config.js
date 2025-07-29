// ==============================================================================
//                Fichier de Configuration pour Vite
//
// Ce fichier permet de personnaliser le comportement de Vite, l'outil de build
// et de serveur de développement pour notre application React.
//
// Configurations clés :
//   - Serveur de Développement : Nous configurons un port par défaut et un proxy
//     pour rediriger les requêtes API vers notre backend, ce qui résout les
//     problèmes de CORS en développement de manière élégante.
//   - Build : Des options pour optimiser le processus de build pour la production.
//   - Preview : Configuration du serveur de prévisualisation.
// ==============================================================================

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement du fichier .env situé dans le
  // répertoire de travail actuel (process.cwd()), qui est /client.
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // --- Plugins ---
    plugins: [
      react(), // Plugin officiel pour le support de React
    ],

    // --- Configuration du Serveur de Développement ---
    server: {
      port: 3000, // Port par défaut pour le serveur de développement
      open: false, // Ne pas ouvrir automatiquement le navigateur
      
      // Configuration du Proxy
      // Toutes les requêtes du frontend qui commencent par '/api' seront
      // redirigées vers le serveur backend.
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true, // Nécessaire pour les hôtes virtuels
          secure: false,      // Ne pas vérifier les certificats SSL (utile pour le dev)
        },
      },
    },

    // --- Configuration du Processus de Build ---
    build: {
      outDir: 'build', // Change le nom du dossier de sortie de 'dist' à 'build'
      sourcemap: true, // Génère des sourcemaps pour le débogage en production
    },
    
    // --- Configuration du Serveur de Prévisualisation ---
    // Permet de tester le build de production localement via `npm run preview`
    preview: {
      port: 3001,
    }
  };
});