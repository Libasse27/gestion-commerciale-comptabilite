// ==============================================================================
//                Composant de Layout Principal de l'Application
//
// Ce composant est maintenant connecté au store Redux pour gérer l'état
// de la sidebar en mode responsive.
//
// Il gère l'affichage de la sidebar et d'un "overlay" en fonction de l'état
// `isSidebarOpen` du `uiSlice`.
// ==============================================================================

import React from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

// Importation des composants de structure
import Sidebar from './Sidebar';
import Header from './Header';

// Importation de l'action pour fermer la sidebar
import { closeSidebar } from '../../store/slices/uiSlice';

// Importation des styles (assurez-vous que components.css contient les styles du layout)
// import './Layout.css'; // Déplacé dans components.css

const Layout = () => {
  const dispatch = useDispatch();
  
  // On lit l'état de la sidebar depuis le store Redux
  const { isSidebarOpen } = useSelector((state) => state.ui);

  const handleCloseSidebar = () => {
    dispatch(closeSidebar());
  };

  return (
    <div className="layout-wrapper">
      {/*
        On passe la classe 'is-open' dynamiquement à la Sidebar.
        Le CSS dans `responsive.css` s'occupera de l'afficher ou non.
      */}
      <Sidebar className={isSidebarOpen ? 'is-open' : ''} />

      {/*
        L'overlay est un fond semi-transparent qui s'affiche sur le contenu
        lorsque la sidebar est ouverte en mode mobile. Un clic dessus la ferme.
      */}
      <div
        className={`sidebar-overlay ${isSidebarOpen ? 'is-active' : ''}`}
        onClick={handleCloseSidebar}
      ></div>

      <div className="content-wrapper">
        <Header />
        <main className="content-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;