// ==============================================================================
//                Fichier de Configuration pour Vite
//
// Ce fichier permet de personnaliser le comportement de Vite, l'outil de build
// et de serveur de développement pour notre application React.
//
// Il configure notamment :
//   - Le port du serveur de développement.
//   - Un proxy pour rediriger les appels API vers le backend et éviter les
//     problèmes de CORS en développement.
//   - Le dossier de sortie pour le build de production.
//   - La compatibilité du code JavaScript final pour les navigateurs.
// ==============================================================================

import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Charge les variables d'environnement du fichier .env correspondant au mode
  // (development, production) depuis le répertoire de travail actuel (`client/`).
  const env = loadEnv(mode, process.cwd(), '');

  return {
    // --- Plugins ---
    plugins: [
      react(), // Plugin officiel pour le support de React (JSX, Fast Refresh, etc.)
    ],

    // --- Configuration du Serveur de Développement (`npm run dev`) ---
    server: {
      port: 3000, // Le port sur lequel le client va s'exécuter
      open: false, // Ne pas ouvrir automatiquement le navigateur
      
      // Configuration du proxy
      proxy: {
        // Toute requête commençant par '/api' sera redirigée.
        '/api': {
          // La cible de la redirection est lue depuis la variable d'environnement,
          // avec une valeur par défaut pour la robustesse.
          target: env.VITE_PROXY_TARGET || 'http://localhost:5000',
          // `changeOrigin` est nécessaire pour que le serveur backend
          // pense que la requête vient de la même origine.
          changeOrigin: true,
          secure: false, // Accepte les certificats auto-signés en développement
        },
      },
    },

    // --- Configuration du Processus de Build (`npm run build`) ---
    build: {
      outDir: 'build', // Le dossier où les fichiers de production seront générés
      sourcemap: true, // Générer des sourcemaps pour faciliter le débogage en production
      
      // Cette option garantit la compatibilité du code final avec une
      // large gamme de navigateurs (tous ceux supportant ES2015+),
      // en transpilant les syntaxes les plus modernes.
      target: 'es2015',
    },
    
    // --- Configuration du Serveur de Prévisualisation (`npm run preview`) ---
    // Permet de tester le build de production localement.
    preview: {
      port: 3001,
      open: true,
    }
  };
});