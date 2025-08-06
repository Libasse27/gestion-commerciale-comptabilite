// client/src/components/common/Header.jsx
import React from 'react';
import { useDispatch } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { Navbar, Nav, Dropdown, Image, Button } from 'react-bootstrap';
import { PersonCircle, BellFill, GearFill, BoxArrowLeft, List } from 'react-bootstrap-icons';

import { useAuth } from '../../hooks/useAuth';
import { usePermissions } from '../../hooks/usePermissions';
import { logout } from '../../store/slices/authSlice';
import ThemeToggleButton from './ThemeToggleButton';

const ProtectedDropdownItem = ({ children, requiredPermission }) => {
  const { hasPermission } = usePermissions();
  return hasPermission(requiredPermission) ? children : null;
};

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login', { replace: true });
  };

  return (
    <Navbar expand="lg" bg="light" variant="light" className="header sticky-top shadow-sm px-3" as="header">
      <Button variant="outline-secondary" onClick={onToggleSidebar} className="d-lg-none me-2 border-0" aria-label="Toggle navigation">
        <List size={24} />
      </Button>
      
      {/* Spacer pour pousser les éléments à droite */}
      <div className="flex-grow-1"></div>

      <Nav className="d-flex flex-row align-items-center">
        <div className="me-2">
          <ThemeToggleButton />
        </div>

        <Nav.Link as={Link} to="/app/notifications" className="me-2" title="Notifications">
          <BellFill size={20} />
          {/* TODO: Ajouter un badge de notifications non lues */}
        </Nav.Link>

        <Dropdown as={Nav.Item} align="end">
          <Dropdown.Toggle as={Nav.Link} className="p-0" id="user-dropdown">
            {/* TODO: Gérer un avatar utilisateur */}
            <PersonCircle size={32} />
          </Dropdown.Toggle>

          <Dropdown.Menu className="mt-2 shadow-lg dropdown-menu-end">
            <Dropdown.Header>
              Connecté en tant que<br />
              <strong>{user?.firstName} {user?.lastName}</strong><br />
              <small className="text-muted">{user?.role}</small>
            </Dropdown.Header>
            <Dropdown.Divider />
            
            <Dropdown.Item as={Link} to="/app/profil"> <PersonCircle className="me-2" /> Mon Profil </Dropdown.Item>

            <ProtectedDropdownItem requiredPermission="system:manage">
              <Dropdown.Item as={Link} to="/app/parametres"> <GearFill className="me-2" /> Paramètres </Dropdown.Item>
            </ProtectedDropdownItem>
            
            <Dropdown.Divider />
            <Dropdown.Item onClick={handleLogout} className="text-danger"> <BoxArrowLeft className="me-2" /> Déconnexion </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Nav>
    </Navbar>
  );
};

export default Header;