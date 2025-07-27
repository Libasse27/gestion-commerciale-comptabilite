// ==============================================================================
//                POINT D'ENTRÉE PRINCIPAL DE L'APPLICATION REACT
//
// Ce fichier est le point de départ de l'application côté client.
// Il est responsable de :
//   - L'importation des feuilles de style globales dans un ordre précis.
//   - La configuration du store Redux.
//   - L'injection des "Providers" de contexte (Redux, Thème, etc.).
//   - Le rendu du composant racine `<App />` dans le DOM.
// ==============================================================================

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// --- Importation des Fournisseurs de Contexte et de State ---
import { Provider } from 'react-redux';
import { store } from './store';
// import { ThemeProvider } from './context/ThemeContext'; // Décommentez si vous utilisez le Contexte pour le thème

// --- IMPORTATION DES FEUILLES DE STYLE GLOBALES ---
// L'ordre est CRUCIAL pour que la cascade de styles fonctionne correctement.

// 1. Variables CSS (tailles, z-index, etc.)
import './styles/variables.css';

// 2. Personnalisation du thème Bootstrap (surcharge des variables de couleur)
import './styles/bootstrap-custom.css';

// 3. Définition des thèmes clair/sombre de l'application
import './styles/themes.css';

// 4. Le framework CSS Bootstrap lui-même
import 'bootstrap/dist/css/bootstrap.min.css';

// 5. Styles des composants personnalisés (Sidebar, Header, etc.)
import './styles/components.css';

// 6. Classes utilitaires personnalisées
import './styles/utilities.css';

// 7. Styles globaux et reset (body, h1, a, etc.)
import './index.css';

// 8. Styles spécifiques pour l'impression
import './styles/print.css';

// 9. Styles responsives (doivent être en dernier pour surcharger les autres)
import './styles/responsive.css';


// --- Rendu de l'application dans le DOM ---

// On cherche l'élément racine `<div id="root">` dans `index.html`
const rootElement = document.getElementById('root');

// On crée la racine de l'application React
const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    {/* Le Provider Redux rend le store accessible à tous les composants */}
    <Provider store={store}>
      {/*
        Le ThemeProvider (si vous l'utilisez) gérerait le changement de thème.
        Il est bon de le placer ici pour envelopper toute l'application.
      */}
      {/* <ThemeProvider> */}
        <App />
      {/* </ThemeProvider> */}
    </Provider>
  </React.StrictMode>
);