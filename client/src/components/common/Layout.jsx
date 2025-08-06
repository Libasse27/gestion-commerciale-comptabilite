// client/src/components/common/Layout.jsx
import React, { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Sidebar from './Sidebar';
import Header from './Header';
import Footer from './Footer';
import { toggleSidebar, closeSidebar } from '../../store/slices/uiSlice';

const Layout = () => {
  const dispatch = useDispatch();
  const location = useLocation();
  const isSidebarOpen = useSelector((state) => state.ui.isSidebarOpen);

  const handleToggleSidebar = () => dispatch(toggleSidebar());
  const handleCloseSidebar = () => dispatch(closeSidebar());
  
  // Ferme la sidebar en changeant de page sur mobile
  useEffect(() => {
    if (isSidebarOpen) {
      handleCloseSidebar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]); // Dépendre de `pathname` est plus précis

  return (
    <div className={`layout-wrapper ${isSidebarOpen ? 'sidebar-open' : ''}`}>
      <Sidebar />
      <div
        className="sidebar-overlay d-lg-none" // L'overlay n'est utile que sur mobile
        onClick={handleCloseSidebar}
        aria-hidden="true"
      />
      <div className="content-wrapper">
        <Header onToggleSidebar={handleToggleSidebar} />
        <main className="main-content p-3 p-md-4">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;