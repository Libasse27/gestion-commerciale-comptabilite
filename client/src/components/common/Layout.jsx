// ==============================================================================
//                Composant de Layout Principal de l'Application
//
// Rôle : Assemble les composants structurels majeurs (Sidebar, Header, Footer)
// et le contenu des routes (via <Outlet>).
//
// Architecture :
// - L'état de visibilité du menu latéral est géré globalement dans le `uiSlice` de Redux.
// - Le Header reçoit une fonction pour *déclencher* l'ouverture/fermeture.
// - La Sidebar et l'Overlay réagissent dynamiquement à l'état du store.
// ==============================================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// --- Importations des composants de structure ---
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';

// --- Importation des actions Redux pour gérer l'UI ---
import { toggleSidebar, closeSidebar } from '../../store/slices/uiSlice';

const Layout = () => {
  const dispatch = useDispatch();
  
  // On lit l'état de la sidebar directement depuis le store Redux.
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);

  // --- Handlers pour interagir avec l'état de l'UI ---
  
  // Fonction pour basculer l'état (ouvrir/fermer). Sera passée au Header.
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };
  
  // Fonction pour forcer la fermeture. Sera utilisée par l'overlay.
  const handleCloseSidebar = () => {
    dispatch(closeSidebar());
  };

  // On construit les classes dynamiquement pour plus de clarté
  const sidebarClassName = isSidebarOpen ? 'layout__sidebar--is-open' : '';
  const overlayClassName = isSidebarOpen ? 'layout__overlay--is-active' : '';

  return (
    // Utilisation de la convention BEM pour les noms de classe
    <div className="layout">
      
      {/* 
        Le menu latéral. Sa classe CSS change en fonction de l'état Redux,
        ce qui déclenche les animations/transitions définies en CSS.
      */}
      <Sidebar className={sidebarClassName} />

      {/*
        L'overlay est un fond qui s'affiche uniquement en mode mobile lorsque le menu
        est ouvert. Un clic dessus ferme le menu, améliorant l'UX.
      */}
      {isSidebarOpen && (
        <div
          className={`layout__overlay ${overlayClassName}`}
          onClick={handleCloseSidebar}
          aria-hidden="true" // C'est un élément purement visuel
        ></div>
      )}

      <div className="layout__content-wrapper">
        {/* 
          On passe la fonction `handleToggleSidebar` au Header. C'est le Header
          qui contiendra le bouton "hamburger" pour ouvrir le menu sur mobile.
        */}
        <Header onToggleSidebar={handleToggleSidebar} />
        
        <main className="layout__main-content">
          {/* Outlet est l'endroit où React Router affichera le composant de la page active */}
          <Outlet />
        </main>
        
        <Footer />
      </div>
    </div>
  );
};

export default Layout;