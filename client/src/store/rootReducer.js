// ==============================================================================
//           Combinaison des Reducers de l'Application (Root Reducer)
//
// Ce fichier utilise la fonction `combineReducers` de Redux Toolkit pour
// assembler tous les reducers de l'application (provenant des différents "slices")
// en un seul "reducer racine".
//
// C'est ce reducer racine qui définit la structure globale de l'état Redux.
// Chaque clé de l'objet correspondra à une tranche ("slice") de l'état global.
//
// Exemple de l'état global résultant :
// {
//   auth: { user: null, token: null, ... },
//   ui: { theme: 'light', isLoading: false, ... },
//   clients: { list: [], loading: false, ... }
// }
// ==============================================================================

import { combineReducers } from '@reduxjs/toolkit';

// --- Importation des reducers de chaque slice ---
// Au fur et à mesure que vous créerez de nouveaux slices, vous les importerez ici.

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice';
import dashboardReducer from './slices/dashboardSlice';
// import clientsReducer from './slices/clientsSlice';
// import produitsReducer from './slices/produitsSlice';
// import facturesReducer from './slices/facturesSlice';
// import comptabiliteReducer from './slices/comptabiliteSlice';

/**
 * Combine tous les reducers en un seul objet.
 * La clé de chaque champ définit le nom de la tranche dans l'état global Redux.
 */
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  dashboard: dashboardReducer,
  // clients: clientsReducer,
  // produits: produitsReducer,
  // factures: facturesReducer,
  // comptabilite: comptabiliteReducer,
  // Ajoutez vos autres reducers ici
});

export default rootReducer;