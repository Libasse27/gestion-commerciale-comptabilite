// client/src/store/slices/uiSlice.js
// ==============================================================================
//           Slice Redux pour la Gestion de l'État de l'UI
//
// Ce slice gère les états globaux de l'interface utilisateur qui ne sont pas
// directement liés à un modèle de données spécifique.
//
// Exemples :
//   - L'état d'ouverture/fermeture de la sidebar.
//   - Le chargement d'une action globale.
//   - L'état d'une modale de confirmation globale.
// ==============================================================================

import { createSlice } from '@reduxjs/toolkit';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

// --- État Initial ---
const initialState = {
  // La sidebar est fermée par défaut sur les petits écrans.
  // Un CSS media query s'occupera de l'afficher par défaut sur les grands écrans.
  isSidebarOpen: false,
};


// --- Création du Slice ---
export const uiSlice = createSlice({
  name: REDUX_SLICE_NAMES.UI,
  initialState,
  
  // Les `reducers` sont les fonctions qui peuvent modifier l'état de ce slice.
  // Ce sont des actions synchrones.
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },
  },
});

// Exporter les créateurs d'actions pour qu'ils puissent être "dispatchés"
// depuis n'importe où dans l'application.
export const { toggleSidebar, openSidebar, closeSidebar } = uiSlice.actions;

// Exporter le reducer pour qu'il puisse être inclus dans le store global.
export default uiSlice.reducer;