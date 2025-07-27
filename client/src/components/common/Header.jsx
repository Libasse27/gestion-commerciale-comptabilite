// ==============================================================================
//                Composant En-tête (Header) de l'Application
//
// Cet en-tête est maintenant entièrement interactif. Il est connecté aux
// slices `auth` et `ui` de Redux pour gérer :
//   - L'affichage des informations de l'utilisateur (`useAuth`).
//   - La déconnexion (`logout` action).
//   - Le basculement de la sidebar en mode responsive (`toggleSidebar` action).
// ==============================================================================

import React from 'react';
import { useDispatch } from 'react-redux';
import { Navbar, Container, Form, InputGroup, Nav, NavDropdown, Button } from 'react-bootstrap';
import { PersonCircle, BellFill, Search, List } from 'react-bootstrap-icons';

// Importation de nos hooks et actions
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import { toggleSidebar } from '../../store/slices/uiSlice'; // <-- 1. Importer l'action de l'UI slice

const Header = () => {
  const dispatch = useDispatch();
  const { isAuthenticated, user } = useAuth();

  const handleLogout = () => {
    dispatch(logout());
  };

  /**
   * Gère le clic sur le bouton "hamburger" pour ouvrir/fermer la sidebar.
   */
  const handleToggleSidebar = () => {
    dispatch(toggleSidebar()); // <-- 2. Dispatcher l'action
  };

  return (
    // La classe `header` vient de `components.css` pour appliquer les variables de thème
    <Navbar as="header" className="header sticky-top">
      <Container fluid>
        {/* Bouton "Hamburger" pour le responsive */}
        <Button
          variant="outline-secondary"
          className="d-lg-none me-2" // Ne s'affiche que sur les écrans plus petits que 'lg'
          onClick={handleToggleSidebar} // <-- 3. Lier l'événement
          aria-label="Basculer la navigation"
        >
          <List size={24} />
        </Button>
        
        {/* Barre de recherche globale (optionnelle) */}
        <div className="flex-grow-1">
          <Form className="d-none d-md-flex" style={{ maxWidth: '400px' }}>
            <InputGroup>
              <InputGroup.Text>
                <Search />
              </InputGroup.Text>
              <Form.Control type="search" placeholder="Recherche globale..." />
            </InputGroup>
          </Form>
        </div>

        {/* Menu utilisateur aligné à droite */}
        <Nav className="ms-auto align-items-center">
          {isAuthenticated && user ? (
            <>
              <Nav.Link href="#notifications" className="d-flex align-items-center">
                <BellFill size={20} />
                <span className="visually-hidden">Notifications</span>
              </Nav.Link>
              
              <NavDropdown
                title={
                  <div className="d-flex align-items-center">
                    <PersonCircle size={24} className="me-2" />
                    <div className="d-none d-lg-block text-start">
                      <div className="fw-bold">{user.fullName}</div>
                      <small className="text-muted">{user.role?.name || 'Utilisateur'}</small>
                    </div>
                  </div>
                }
                id="user-nav-dropdown"
                align="end"
              >
                <NavDropdown.Item href="#profile">Mon Profil</NavDropdown.Item>
                <NavDropdown.Item href="#settings">Paramètres du compte</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout} className="text-danger">
                  Déconnexion
                </NavDropdown.Item>
              </NavDropdown>
            </>
          ) : (
            <Nav.Link href="/login">Se connecter</Nav.Link>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;