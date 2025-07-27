// ==============================================================================
//                Composant Menu Latéral de Navigation (Sidebar)
//
// Ce composant affiche le menu de navigation principal de l'application.
// Il utilise `react-router-dom` pour la navigation et met en surbrillance
// le lien de la page actuellement active.
//
// La structure des liens est organisée par module pour plus de clarté.
// Des icônes sont utilisées pour améliorer l'expérience utilisateur.
// ==============================================================================

import React from 'react';
import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import {
  HouseDoorFill, Speedometer2, PeopleFill, BoxSeam,
  Receipt, BookFill, CashCoin, BarChartFill, GearFill
} from 'react-bootstrap-icons';

import './Sidebar.css'; // Pour un style personnalisé

// Un composant interne pour créer les liens de navigation
const NavItem = ({ to, icon, text }) => {
  const IconComponent = icon;
  return (
    <Nav.Item>
      <Nav.Link as={NavLink} to={to} end>
        <IconComponent className="me-2" />
        {text}
      </Nav.Link>
    </Nav.Item>
  );
};


const Sidebar = () => {
  return (
    <aside className="sidebar bg-dark text-white vh-100">
      <div className="sidebar-header p-3">
        <h4>ERP Sénégal</h4>
      </div>
      <Nav className="flex-column sidebar-nav">
        {/* -- Section Principale -- */}
        <NavItem to="/" icon={HouseDoorFill} text="Accueil" />
        <NavItem to="/dashboard" icon={Speedometer2} text="Tableau de bord" />

        {/* -- Section Gestion Commerciale -- */}
        <div className="nav-section-title">Gestion Commerciale</div>
        <NavItem to="/clients" icon={PeopleFill} text="Clients" />
        <NavItem to="/fournisseurs" icon={PeopleFill} text="Fournisseurs" />
        <NavItem to="/produits" icon={BoxSeam} text="Produits & Services" />
        <NavItem to="/ventes" icon={Receipt} text="Ventes" />

        {/* -- Section Comptabilité -- */}
        <div className="nav-section-title">Comptabilité</div>
        <NavItem to="/comptabilite/ecritures" icon={BookFill} text="Écritures" />
        <NavItem to="/comptabilite/plan" icon={BookFill} text="Plan Comptable" />

        {/* -- Section Trésorerie -- */}
        <div className="nav-section-title">Trésorerie</div>
        <NavItem to="/paiements" icon={CashCoin} text="Paiements" />

        {/* -- Section Rapports -- */}
        <div className="nav-section-title">Analyse</div>
        <NavItem to="/rapports" icon={BarChartFill} text="Rapports" />

        {/* -- Section Paramètres (en bas) -- */}
        <div className="mt-auto">
          <NavItem to="/parametres" icon={GearFill} text="Paramètres" />
        </div>
      </Nav>
    </aside>
  );
};

export default Sidebar;