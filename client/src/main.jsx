// ==============================================================================
//           Point d'Entrée de l'Application Client (main.jsx)
//
// Ce fichier est le tout premier script exécuté par le navigateur.
// Son rôle est de :
//   1. Importer toutes les feuilles de style globales dans le bon ordre.
//   2. "Rendre" le composant racine `<App />` dans l'élément `#root`
//      du fichier `index.html`.
// ==============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';

// --- Importation des Feuilles de Style Globales ---
// L'ordre d'importation est crucial pour la cascade des styles (CSS).

// 1. Personnalisation de Bootstrap (surcharge les variables par défaut)
import './styles/bootstrap-custom.css';

// 2. Variables de design globales (dimensions, z-index, etc.)
import './styles/variables.css';

// 3. Le CSS principal de Bootstrap (qui utilisera nos variables personnalisées)
import 'bootstrap/dist/css/bootstrap.min.css';

// 4. Styles globaux de base et thèmes
import './styles/globals.css';
import './styles/themes.css';

// 5. Styles pour nos composants personnalisés
import './styles/components.css';

// 6. Classes utilitaires
import './styles/utilities.css';

// 7. Styles spécifiques (impression, responsive)
import './styles/print.css';
import './styles/responsive.css';


// --- Importation du Composant Racine ---
import App from './App.jsx';


// --- Rendu de l'Application ---
// On cible l'élément `<div id="root"></div>` dans le fichier `public/index.html`.
ReactDOM.createRoot(document.getElementById('root')).render(
  // `React.StrictMode` est un outil de développement qui aide à détecter
  // les problèmes potentiels dans l'application. Il n'a pas d'impact en production.
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);