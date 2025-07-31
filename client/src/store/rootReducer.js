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
//   ui: { isSidebarOpen: true, ... },
//   clients: { list: [], loading: false, ... }
// }
// ==============================================================================

import { combineReducers } from '@reduxjs/toolkit';

// --- Importation des reducers de chaque slice ---
// Au fur et à mesure que vous créerez de nouveaux slices, vous les importerez et
// les ajouterez à l'objet `combineReducers` ci-dessous.

import authReducer from './slices/authSlice';
import uiReducer from './slices/uiSlice'; // À créer
import dashboardReducer from './slices/dashboardSlice'; // À créer
import clientsReducer from './slices/clientsSlice'; // À créer
// import produitsReducer from './slices/produitsSlice';
// ... etc.

/**
 * Combine tous les reducers en un seul objet.
 * La clé de chaque champ définit le nom de la tranche dans l'état global Redux,
 * accessible via `useSelector(state => state.nomDeLaTranche)`.
 */
const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  dashboard: dashboardReducer,
  clients: clientsReducer,
  // ... Ajoutez vos autres reducers ici au fur et à mesure
});

export default rootReducer;