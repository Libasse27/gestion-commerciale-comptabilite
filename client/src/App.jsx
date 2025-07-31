// ==============================================================================
//           Composant Racine de l'Application (App.jsx)
//
// Ce fichier est le point d'entrée principal de l'interface React.
// Son unique responsabilité est d'assembler les "Providers" de contexte
// globaux et le système de routage de l'application.
//
// L'ordre des Providers est important : les hooks utilisés dans un Provider
// doivent provenir d'un Provider qui l'englobe.
// ==============================================================================

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

// --- Importation des contextes et du store ---
import store from './store';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/routes'; // Le composant qui gère toutes les routes

/**
 * Le composant principal de l'application.
 */
function App() {
  return (
    // 1. Fournisseur Redux : Rend le store disponible à toute l'application.
    <ReduxProvider store={store}>
      {/* 2. Fournisseur de Thème : Gère le thème clair/sombre. */}
      <ThemeProvider>
        {/* 3. Fournisseur de Notifications : Gère l'affichage des toasts. */}
        <NotificationProvider>
          {/* 4. Fournisseur de Socket : Gère la connexion WebSocket.
                 Il est à l'intérieur de ReduxProvider pour pouvoir lire le token. */}
          <SocketProvider>
            {/* 5. Fournisseur de Routage : Active la navigation côté client. */}
            <Router>
              {/* 6. Le routeur de l'application qui affiche la page appropriée. */}
              <AppRoutes />
            </Router>
          </SocketProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default App;