// ==============================================================================
//           Slice Redux pour la Gestion de l'État de l'Interface Utilisateur (UI)
//
// Rôle : Ce slice centralise la gestion des états de l'UI non liés aux données,
// tels que l'état du menu, le thème, ou les indicateurs de chargement globaux.
// Il assure une séparation nette entre l'état de l'application et l'état de l'UI.
//
// Bonnes Pratiques Implémentées :
// - Persistance du thème dans le localStorage.
// - Détection du thème préféré de l'utilisateur.
// - Reducers atomiques et clairs.
// ==============================================================================

import { createSlice } from '@reduxjs/toolkit';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';

/**
 * Détermine le thème initial de l'application.
 * Priorité : Thème sauvegardé > Préférence système > Thème par défaut ('light').
 * @returns {'light' | 'dark'} Le thème à utiliser.
 */
const getInitialTheme = () => {
  try {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEYS.UI_THEME);
    if (savedTheme === 'light' || savedTheme === 'dark') {
      return savedTheme;
    }

    // Si aucun thème n'est sauvegardé, on se fie aux préférences de l'OS/navigateur.
    if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
  } catch (error) {
    console.error("Impossible d'accéder au localStorage pour le thème :", error);
  }
  return 'light'; // Thème par défaut
};

// --- État Initial ---
const initialState = {
  theme: getInitialTheme(),
  isSidebarOpen: false, // Le menu est fermé par défaut sur les petits écrans
  globalLoading: false, // Indicateur pour un loader global (ex: au chargement initial)
};


// --- Création du Slice ---
export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  
  // Les reducers définissent comment l'état peut être modifié de manière synchrone.
  reducers: {
    /**
     * Bascule l'état d'ouverture du menu latéral (sidebar).
     */
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    
    /**
     * Force l'ouverture du menu latéral.
     */
    openSidebar: (state) => {
      state.isSidebarOpen = true;
    },

    /**
     * Force la fermeture du menu latéral.
     */
    closeSidebar: (state) => {
      state.isSidebarOpen = false;
    },

    /**
     * Change le thème de l'application ('light' ou 'dark').
     * @param {object} action - L'action contenant le nouveau thème dans `action.payload`.
     */
    setTheme: (state, action) => {
      const newTheme = action.payload === 'dark' ? 'dark' : 'light';
      state.theme = newTheme;
      // La persistance est gérée directement ici pour une meilleure encapsulation.
      try {
        localStorage.setItem(LOCAL_STORAGE_KEYS.UI_THEME, newTheme);
      } catch (error) {
        console.error("Impossible de sauvegarder le thème dans le localStorage :", error);
      }
    },
    
    /**
     * Active ou désactive l'indicateur de chargement global.
     * @param {object} action - L'action où `action.payload` est un booléen.
     */
    setGlobalLoading: (state, action) => {
        state.globalLoading = !!action.payload; // Assure que la valeur est un booléen
    }
  },
});

// --- Exportation des Actions ---
// Ces "action creators" sont générés automatiquement par `createSlice`.
export const {
  toggleSidebar,
  openSidebar,
  closeSidebar,
  setTheme,
  setGlobalLoading,
} = uiSlice.actions;


// --- Exportation des Sélecteurs (Bonne Pratique de Performance) ---
// Les sélecteurs permettent d'extraire des données du store.
// En les définissant ici, on centralise la logique d'accès à l'état.
export const selectTheme = (state) => state.ui.theme;
export const selectIsSidebarOpen = (state) => state.ui.isSidebarOpen;
export const selectIsGlobalLoading = (state) => state.ui.globalLoading;


// --- Exportation du Reducer ---
// Le reducer sera ajouté au `rootReducer` global.
export default uiSlice.reducer;