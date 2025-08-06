// client/src/components/common/Sidebar.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { Nav } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  Speedometer2, PeopleFill, BoxSeam, Receipt, BookFill,
  BarChartFill, GearFill, BoxArrowLeft, Building, Folder,
  Bank, Box, JournalCheck
} from 'react-bootstrap-icons';
import { logout } from '../../store/slices/authSlice';
import { usePermissions } from '../../hooks/usePermissions';

// Sous-composants pour la lisibilité
const NavItem = ({ to, icon: Icon, text }) => (
  <Nav.Item as="li">
    <Nav.Link as={NavLink} to={to} end className="d-flex align-items-center gap-2">
      <Icon size={18} />
      <span>{text}</span>
    </Nav.Link>
  </Nav.Item>
);

const Protected = ({ children, permission, any = false }) => {
  const { hasPermission, hasAnyPermission } = usePermissions();
  const show = any ? hasAnyPermission(permission) : hasPermission(permission);
  return show ? children : null;
};

const NavSectionTitle = ({ text }) => <h6 className="sidebar-heading px-3 mt-4 mb-1 text-muted text-uppercase">{text}</h6>;

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <nav className="sidebar bg-light border-end">
      <div className="sidebar-sticky">
        <h5 className="sidebar-heading px-3 mt-3 mb-3">
            <NavLink to="/dashboard" className="text-decoration-none text-dark fw-bold">
                {import.meta.env.VITE_APP_NAME || 'ERP Sénégal'}
            </NavLink>
        </h5>
        <Nav className="flex-column" as="ul">
          <NavItem to="/dashboard" icon={Speedometer2} text="Tableau de bord" />

          <Protected permission={['client:read', 'fournisseur:read', 'produit:read', 'vente:read']} any>
              <NavSectionTitle text="Commercial" />
          </Protected>
          <Protected permission="client:read"><NavItem to="/clients" icon={PeopleFill} text="Clients" /></Protected>
          <Protected permission="fournisseur:read"><NavItem to="/fournisseurs" icon={Building} text="Fournisseurs" /></Protected>
          <Protected permission="produit:read"><NavItem to="/produits" icon={BoxSeam} text="Catalogue" /></Protected>
          <Protected permission="vente:read"><NavItem to="/ventes" icon={Receipt} text="Ventes" /></Protected>

          <Protected permission="stock:read" any>
            <NavSectionTitle text="Stock" />
            <NavItem to="/stock" icon={Box} text="État du Stock" />
          </Protected>

          <Protected permission="comptabilite:read" any>
            <NavSectionTitle text="Comptabilité" />
            <NavItem to="/comptabilite/ecritures" icon={JournalCheck} text="Écritures" />
            <NavItem to="/comptabilite/rapprochement" icon={Bank} text="Rapprochement" />
          </Protected>
        </Nav>
      </div>
      
      <div className="sidebar-footer">
        <Nav className="flex-column" as="ul">
            <Protected permission="system:manage">
                <NavItem to="/parametres" icon={GearFill} text="Paramètres" />
            </Protected>
            <Nav.Item as="li">
              <Nav.Link onClick={handleLogout} className="d-flex align-items-center gap-2 text-danger">
                <BoxArrowLeft size={18} />
                <span>Déconnexion</span>
              </Nav.Link>
            </Nav.Item>
        </Nav>
      </div>
    </nav>
  );
};

export default Sidebar;