// ==============================================================================
//                Fichier de Configuration pour Vite (Version Corrigée)
//
// Ce fichier permet de personnaliser le comportement de Vite, l'outil de build
// et de serveur de développement pour notre application React.
//
// CORRECTION CLÉ :
// Ajout de l'option `build.target` pour assurer la compatibilité du code
// JavaScript généré avec une plus large gamme de navigateurs, ce qui résout
// les erreurs de syntaxe (SyntaxError).
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
      port: 3000,
      open: false,
      proxy: {
        '/api': {
          target: env.VITE_PROXY_TARGET || 'http://localhost:5000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    // --- Configuration du Processus de Build ---
    build: {
      outDir: 'build',
      sourcemap: true,
      
      // --- CORRECTION AJOUTÉE ICI ---
      // Cette option indique à Vite de "transpiler" (traduire) le code final
      // en une version de JavaScript compatible avec tous les navigateurs
      // depuis 2015. Cela garantit que les syntaxes modernes comme le
      // "optional chaining" (`?.`) sont converties en code plus ancien,
      // ce qui élimine les "SyntaxError".
      target: 'es2015',
    },
    
    // --- Configuration du Serveur de Prévisualisation ---
    preview: {
      port: 3001,
    }
  };
});