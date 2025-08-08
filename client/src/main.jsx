// client/src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';

// Styles
import './styles/bootstrap-custom.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/globals.css';
// ... (autres imports CSS)

import App from './App.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);