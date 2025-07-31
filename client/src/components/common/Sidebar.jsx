// ==============================================================================
//                Composant Menu Latéral de Navigation (Sidebar)
//
// Affiche le menu de navigation principal de l'application. Les liens affichés
// sont conditionnés par les permissions de l'utilisateur connecté, récupérées
// via le hook `usePermissions`.
// ==============================================================================
import React from 'react';
import { useDispatch } from 'react-redux';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  Speedometer2, PeopleFill, BoxSeam, Receipt, BookFill,
  BarChartFill, GearFill, BoxArrowLeft, Building, Folder
} from 'react-bootstrap-icons';

import { logout } from '../../store/slices/authSlice';
import { usePermissions } from '../../hooks/usePermissions';

// --- Sous-composant pour un lien de navigation ---
const NavItem = ({ to, icon: Icon, text }) => (
  <Nav.Item>
    <Nav.Link as={NavLink} to={to} end className="d-flex align-items-center">
      <Icon size={20} className="nav-icon" />
      <span>{text}</span>
    </Nav.Link>
  </Nav.Item>
);

// --- Sous-composant "gardien" pour protéger les liens ---
const ProtectedNavItem = ({ requiredPermission, children }) => {
  const { hasPermission } = usePermissions();
  return hasPermission(requiredPermission) ? children : null;
};

// --- Sous-composant pour un titre de section ---
const NavSectionTitle = ({ text }) => <div className="sidebar-nav-title">{text}</div>;

// ==========================================================
// --- Composant Principal Sidebar ---
// ==========================================================
const Sidebar = () => {
  const dispatch = useDispatch();
  const { hasAnyPermission } = usePermissions();

  const handleLogout = () => {
    dispatch(logout());
    // La redirection est gérée par PrivateRoute
  };

  // On détermine si l'utilisateur a le droit de voir au moins un élément de chaque section
  const canSeeCommercial = hasAnyPermission(['client:read', 'fournisseur:read', 'produit:read', 'vente:read']);
  const canSeeComptabilite = hasAnyPermission(['comptabilite:read']);
  const canSeeAnalyse = hasAnyPermission(['rapport:read']);

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <NavLink to="/dashboard" className="app-logo">
          {import.meta.env.VITE_APP_NAME || 'ERP Sénégal'}
        </NavLink>
      </div>
      
      <Nav className="flex-column sidebar-nav">
        {/* --- Section Principale --- */}
        <NavItem to="/dashboard" icon={Speedometer2} text="Tableau de bord" />

        {/* --- Section Gestion Commerciale (conditionnelle) --- */}
        {canSeeCommercial && <NavSectionTitle text="Gestion Commerciale" />}
        <ProtectedNavItem requiredPermission="client:read">
          <NavItem to="/clients" icon={PeopleFill} text="Clients" />
        </ProtectedNavItem>
        <ProtectedNavItem requiredPermission="fournisseur:read">
          <NavItem to="/fournisseurs" icon={Building} text="Fournisseurs" />
        </ProtectedNavItem>
        <ProtectedNavItem requiredPermission="produit:read">
          <NavItem to="/produits" icon={BoxSeam} text="Produits & Services" />
        </ProtectedNavItem>
        <ProtectedNavItem requiredPermission="vente:read">
          <NavItem to="/ventes" icon={Receipt} text="Ventes" />
        </ProtectedNavItem>

        {/* --- Section Comptabilité (conditionnelle) --- */}
        {canSeeComptabilite && (
          <>
            <NavSectionTitle text="Comptabilité" />
            <NavItem to="/comptabilite" icon={BookFill} text="Journaux" />
          </>
        )}

        {/* --- Section Analyse (conditionnelle) --- */}
        {canSeeAnalyse && (
          <>
            <NavSectionTitle text="Analyse" />
            <NavItem to="/rapports" icon={BarChartFill} text="Rapports" />
          </>
        )}
      </Nav>
      
      {/* --- Section du Bas (collée en bas) --- */}
      <div className="sidebar-footer">
        <ProtectedNavItem requiredPermission="settings:manage">
          <NavItem to="/parametres" icon={GearFill} text="Paramètres" />
        </ProtectedNavItem>
        <Nav.Item>
          <Nav.Link onClick={handleLogout} className="text-danger">
            <BoxArrowLeft size={20} className="nav-icon" />
            <span>Déconnexion</span>
          </Nav.Link>
        </Nav.Item>
      </div>
    </aside>
  );
};

export default Sidebar;