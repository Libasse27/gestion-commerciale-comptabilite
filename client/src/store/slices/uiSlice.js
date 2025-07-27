// ==============================================================================
//           Slice Redux pour la Gestion de l'État de l'Interface Utilisateur (UI)
//
// Ce slice est responsable de la gestion des états qui concernent
// l'interface utilisateur mais qui ne sont pas des données métier, tels que :
//   - L'état d'ouverture de la sidebar en mode responsive.
//   - Le thème actuel de l'application (clair ou sombre).
//   - L'état de chargement global.
//
// Il permet de découpler la logique de l'UI de la logique des données.
// ==============================================================================

import { createSlice } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';

/**
 * Fonction pour récupérer le thème initial depuis le localStorage ou les
 * préférences du système d'exploitation de l'utilisateur.
 */
const getInitialTheme = () => {
  const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.UI_THEME);
  if (savedTheme) {
    return savedTheme;
  }
  // Si aucun thème n'est sauvegardé, on regarde les préférences du navigateur/OS
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  return 'light';
};

// --- État Initial ---
const initialState = {
  theme: getInitialTheme(),
  isSidebarOpen: false, // La sidebar est fermée par défaut sur les petits écrans
  globalLoading: false,
};


// --- Création du Slice ---

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  
  // Reducers pour les actions synchrones
  reducers: {
    /**
     * Bascule l'état de la sidebar (ouvert/fermé).
     */
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    
    /**
     * Ouvre la sidebar.
     */
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },

    /**
     * Ferme la sidebar.
     */
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },

    /**
     * Change le thème de l'application et le sauvegarde dans le localStorage.
     * @param {object} state - L'état actuel.
     * @param {object} action - L'action contenant le nouveau thème dans son payload.
     */
    setTheme: (state, action) => {
      const newTheme = action.payload;
      state.theme = newTheme;
      localStorage.setItem(LOCAL_STORAGE_KEYS.UI_THEME, newTheme);
      // La logique pour appliquer l'attribut `data-theme` au document
      // peut se faire dans un `useEffect` qui écoute ce changement d'état.
    },
    
    /**
     * Active le loader global.
     */
    setGlobalLoading: (state, action) => {
        state.globalLoading = action.payload;
    }
  },
});

// --- Exportation des Actions et du Reducer ---

export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  setTheme,
  setGlobalLoading,
} = uiSlice.actions;

export default uiSlice.reducer;