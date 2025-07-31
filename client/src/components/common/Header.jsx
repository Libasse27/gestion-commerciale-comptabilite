// ==============================================================================
//                Composant En-tête de l'Application (Header)
//
// Rôle : Affiche la barre de navigation supérieure. Contient un bouton pour
// basculer le menu latéral sur mobile, des liens rapides (notifications),
// le bouton de changement de thème, et un menu déroulant pour l'utilisateur.
// ==============================================================================

import React from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { Navbar, Nav, Dropdown, Image, Button } from 'react-bootstrap';
import { PersonCircle, BellFill, GearFill, BoxArrowLeft, List } from 'react-bootstrap-icons';

// --- Importations personnalisées ---
import { useAuth } from '../../hooks/useAuth';
import { logout } from '../../store/slices/authSlice';
import ThemeToggleButton from './ThemeToggleButton'; // Notre bouton de thème

/**
 * Sous-composant pour un item de menu déroulant qui ne s'affiche que si
 * l'utilisateur a la permission requise.
 * @param {{
 *  requiredPermission: string,
 *  children: React.ReactNode
 * }} props
 */
const ProtectedDropdownItem = ({ requiredPermission, children }) => {
  const { permissions } = useAuth();
  // Vérifie si l'utilisateur a la permission requise dans le Set de permissions.
  if (permissions.has(requiredPermission)) {
    return children;
  }
  return null;
};


// ==========================================================
// --- Composant Principal Header ---
// ==========================================================
/**
 * @param {{
 *  onToggleSidebar: () => void
 * }} props
 */
const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch(logout());
    // La redirection sera gérée automatiquement par le PrivateRoute
  };

  return (
    <Navbar expand="lg" className="header sticky-top shadow-sm px-3" as="header">
      {/* Bouton pour afficher/masquer le menu latéral sur mobile */}
      <Button
        variant="outline-secondary"
        onClick={onToggleSidebar}
        className="d-lg-none me-2 border-0" // Rendu invisible sur les grands écrans
        aria-label="Toggle navigation"
      >
        <List size={24} />
      </Button>

      {/* Barre de recherche (Placeholder) */}
      <div className="d-none d-md-block">
        {/* <Form.Control type="search" placeholder="Rechercher..." /> */}
      </div>
      
      {/* On pousse le contenu suivant vers la droite */}
      <Nav className="ms-auto d-flex flex-row align-items-center">
        
        {/* Bouton de changement de thème */}
        <div className="me-3">
          <ThemeToggleButton />
        </div>

        {/* Icône de Notifications (exemple) */}
        <Nav.Link as={Link} to="/notifications" className="me-3" title="Notifications">
          <BellFill size={20} />
          {/* <Badge pill bg="danger" style={{ position: 'absolute', top: '5px', right: '5px' }}>3</Badge> */}
        </Nav.Link>

        {/* Menu déroulant de l'utilisateur */}
        <Dropdown as={Nav.Item} align="end">
          <Dropdown.Toggle as={Nav.Link} className="p-0" id="user-dropdown-toggle">
            {/* Affiche l'avatar de l'utilisateur ou une icône par défaut */}
            {user?.avatarUrl ? (
              <Image src={user.avatarUrl} roundedCircle width={36} height={36} />
            ) : (
              <PersonCircle size={36} />
            )}
          </Dropdown.Toggle>

          <Dropdown.Menu className="mt-2">
            <Dropdown.Header>
              Connecté en tant que<br />
              <strong>{user?.firstName} {user?.lastName}</strong>
            </Dropdown.Header>
            <Dropdown.Divider />
            
            <Dropdown.Item as={Link} to="/profil">
              <PersonCircle className="me-2" />
              Mon Profil
            </Dropdown.Item>

            <ProtectedDropdownItem requiredPermission="settings:manage">
              <Dropdown.Item as={Link} to="/parametres">
                <GearFill className="me-2" />
                Paramètres
              </Dropdown.Item>
            </ProtectedDropdownItem>
            
            <Dropdown.Divider />

            <Dropdown.Item onClick={handleLogout} className="text-danger">
              <BoxArrowLeft className="me-2" />
              Déconnexion
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown>
      </Nav>
    </Navbar>
  );
};

export default Header;