// client/src/App.jsx
// ==============================================================================
//           Composant Racine de l'Application (App.jsx)
// ==============================================================================

import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';

// --- Importation des contextes et du store ---
import store from './store';
import { ThemeProvider } from './context/ThemeContext';
import { NotificationProvider } from './context/NotificationContext';
import { SocketProvider } from './context/SocketContext';
import AppRoutes from './routes/AppRoutes';

function App() {
  return (
    <ReduxProvider store={store}>
      <ThemeProvider>
        <NotificationProvider>
          <SocketProvider>
            <Router>
              <AppRoutes />
            </Router>
          </SocketProvider>
        </NotificationProvider>
      </ThemeProvider>
    </ReduxProvider>
  );
}

export default App;