// ==============================================================================
//                Composant En-tête (Header) de l'Application
//
// Cet en-tête s'affiche en haut de la zone de contenu principal.
// Il contient des éléments contextuels comme :
//   - Le titre de la page actuelle (ou un fil d'Ariane).
//   - Une barre de recherche globale.
//   - Un menu pour l'utilisateur connecté (profil, déconnexion).
// ==============================================================================

import React from 'react';
import { Navbar, Container, Form, InputGroup, Nav, NavDropdown } from 'react-bootstrap';
import { PersonCircle, BellFill, Search } from 'react-bootstrap-icons';
// import { useLocation } from 'react-router-dom'; // Pour obtenir le titre de la page

const Header = () => {
  // --- Logique pour obtenir le nom de l'utilisateur (à remplacer par Redux/Context) ---
  // Pour l'instant, on utilise une valeur factice.
  const user = {
    fullName: 'libdev_prod',
    role: 'Admin',
  };

  // --- Logique pour le titre de la page (optionnel) ---
  // const location = useLocation();
  // const getPageTitle = () => {
  //   // Logique pour mapper pathname à un titre
  //   return "Tableau de bord";
  // };

  const handleLogout = () => {
    // Logique de déconnexion à implémenter (appel Redux/service)
    alert('Déconnexion...');
  };

  return (
    <Navbar bg="light" expand="lg" className="border-bottom sticky-top">
      <Container fluid>
        {/* On peut ajouter un bouton pour afficher/masquer la sidebar sur mobile ici */}
        {/* <Navbar.Toggle aria-controls="sidebar-nav" /> */}
        
        <Navbar.Brand href="#">
          {/* Titre de la page, ex: getPageTitle() */}
        </Navbar.Brand>

        {/* Barre de recherche (alignée à gauche après le titre) */}
        <Form className="d-none d-md-flex ms-auto me-3" style={{ width: '400px' }}>
          <InputGroup>
            <InputGroup.Text>
              <Search />
            </InputGroup.Text>
            <Form.Control type="search" placeholder="Recherche globale..." />
          </InputGroup>
        </Form>

        {/* Icônes et menu utilisateur (alignés à droite) */}
        <Nav className="ms-auto">
          <Nav.Link href="#notifications" className="d-flex align-items-center">
            <BellFill size={20} />
            <span className="visually-hidden">Notifications</span>
          </Nav.Link>
          
          <NavDropdown
            title={
              <div className="d-flex align-items-center">
                <PersonCircle size={24} className="me-2" />
                <div className="d-none d-lg-block">
                  <div className="fw-bold">{user.fullName}</div>
                  <small className="text-muted">{user.role}</small>
                </div>
              </div>
            }
            id="user-nav-dropdown"
            align="end" // Aligne le menu déroulant à droite
          >
            <NavDropdown.Item href="#profile">Mon Profil</NavDropdown.Item>
            <NavDropdown.Item href="#settings">Paramètres du compte</NavDropdown.Item>
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={handleLogout} className="text-danger">
              Déconnexion
            </NavDropdown.Item>
          </NavDropdown>
        </Nav>
      </Container>
    </Navbar>
  );
};

export default Header;