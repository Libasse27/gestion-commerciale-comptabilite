// ==============================================================================
//                Composant Menu Latéral de Navigation (Sidebar)
//
// Ce composant affiche le menu de navigation principal et est maintenant
// dynamique : il n'affiche que les liens correspondant aux permissions
// de l'utilisateur connecté.
//
// Il utilise le hook `useAuth` pour obtenir les informations de l'utilisateur
// et ses permissions.
// ==============================================================================

import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  HouseDoorFill, Speedometer2, PeopleFill, BoxSeam,
  Receipt, BookFill, CashCoin, BarChartFill, GearFill
} from 'react-bootstrap-icons';

import { useAuth } from '../../hooks/useAuth'; // Pour vérifier les permissions
import { USER_ROLES } from '../../utils/constants'; // Pour vérifier les rôles si besoin

// --- Composants de Navigation Internes ---

// Composant de base pour un lien
const NavItem = ({ to, icon, text }) => {
  const IconComponent = icon;
  return (
    <Nav.Item>
      <Nav.Link as={NavLink} to={to} end>
        <IconComponent size={18} className="me-3" />
        <span>{text}</span>
      </Nav.Link>
    </Nav.Item>
  );
};

// Composant "gardien" pour les liens nécessitant une permission
const ProtectedNavItem = ({ requiredPermission, children }) => {
  const { user } = useAuth();
  
  // Les permissions de l'utilisateur sont dans `user.role.permissions`
  // Note : Le back-end doit "populer" les permissions dans l'objet `role`.
  const userPermissions = user?.role?.permissions || [];
  
  // On vérifie si l'utilisateur est Admin ou si ses permissions incluent celle requise
  const isAdmin = user?.role?.name === USER_ROLES.ADMIN;
  const hasPermission = userPermissions.some(p => p.name === requiredPermission);

  if (isAdmin || hasPermission) {
    return children;
  }
  
  return null; // N'affiche rien si l'utilisateur n'a pas la permission
};


// --- Composant Principal Sidebar ---

const Sidebar = ({ className }) => { // Accepte une prop `className` pour le mode responsive
  return (
    <aside className={`sidebar ${className || ''}`}>
      <div className="sidebar-header">
        <h4>ERP Sénégal</h4>
      </div>
      <Nav className="flex-column sidebar-nav">
        {/* -- Section Principale -- */}
        <NavItem to="/dashboard" icon={Speedometer2} text="Tableau de bord" />

        {/* -- Section Gestion Commerciale -- */}
        <div className="nav-section-title">Gestion Commerciale</div>
        <ProtectedNavItem requiredPermission="read:client">
          <NavItem to="/clients" icon={PeopleFill} text="Clients" />
        </ProtectedNavItem>
        <ProtectedNavItem requiredPermission="read:fournisseur">
          <NavItem to="/fournisseurs" icon={PeopleFill} text="Fournisseurs" />
        </ProtectedNavItem>
        <ProtectedNavItem requiredPermission="read:produit">
          <NavItem to="/produits" icon={BoxSeam} text="Produits & Services" />
        </ProtectedNavItem>
        <ProtectedNavItem requiredPermission="read:vente">
          <NavItem to="/ventes" icon={Receipt} text="Ventes" />
        </ProtectedNavItem>

        {/* -- Section Comptabilité -- */}
        <ProtectedNavItem requiredPermission="read:comptabilite">
          <div className="nav-section-title">Comptabilité</div>
          <NavItem to="/comptabilite/ecritures" icon={BookFill} text="Écritures" />
          <NavItem to="/comptabilite/plan" icon={BookFill} text="Plan Comptable" />
        </ProtectedNavItem>
        
        {/* -- Section Trésorerie -- */}
        <ProtectedNavItem requiredPermission="read:paiement">
            <div className="nav-section-title">Trésorerie</div>
            <NavItem to="/paiements" icon={CashCoin} text="Paiements" />
        </ProtectedNavItem>

        {/* -- Section Rapports -- */}
        <ProtectedNavItem requiredPermission="read:rapport">
            <div className="nav-section-title">Analyse</div>
            <NavItem to="/rapports" icon={BarChartFill} text="Rapports" />
        </ProtectedNavItem>
        

        {/* -- Section Paramètres (en bas, réservée à l'Admin) -- */}
        <div className="mt-auto">
            <ProtectedNavItem requiredPermission="manage:settings">
                <NavItem to="/parametres" icon={GearFill} text="Paramètres" />
            </ProtectedNavItem>
        </div>
      </Nav>
    </aside>
  );
};

export default Sidebar;