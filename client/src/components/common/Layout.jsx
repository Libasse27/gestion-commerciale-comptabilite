// ==============================================================================
//                Composant de Layout Principal de l'Application
//
// Ce composant est le conteneur principal pour toutes les pages authentifiées
// de l'application. Il est responsable de l'agencement général de l'interface.
//
// Il assemble les composants communs :
//   - `Sidebar`: Le menu de navigation principal, fixe à gauche.
//   - `Header`: La barre supérieure contextuelle.
//
// Et utilise le composant `<Outlet>` de `react-router-dom` pour rendre
// le contenu de la page active.
// ==============================================================================

import React from 'react';
import { Outlet } from 'react-router-dom';

// Importation des composants de structure
import Sidebar from './Sidebar';
import Header from './Header';

// Importation des styles spécifiques au layout
import './Layout.css';

const Layout = () => {
  return (
    <div className="layout-wrapper">
      {/* La Sidebar est fixe et toujours présente */}
      <Sidebar />

      {/* Ce conteneur englobe toute la partie droite de l'écran */}
      <div className="content-wrapper">
        {/* Le Header se trouve en haut de la zone de contenu */}
        <Header />

        {/* La zone de contenu principal où les pages seront rendues */}
        <main className="content-main p-4">
          {/* Outlet est le placeholder de react-router-dom pour le composant de la route actuelle */}
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;