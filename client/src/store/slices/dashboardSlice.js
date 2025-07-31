// ==============================================================================
//           Slice Redux pour la Gestion de l'État du Tableau de Bord
//
// MISE À JOUR : Utilise maintenant un thunk unique `fetchDashboardData` pour
// récupérer toutes les données du tableau de bord en un seul appel API,
// ce qui est plus performant.
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';
import { getErrorMessage } from '../../utils/helpers';

// --- État Initial ---
const initialState = {
  kpis: {
    chiffreAffairesAujourdhui: 0,
    nouveauxClientsAujourdhui: 0,
    devisEnAttente: 0,
    tresorerie: 0,
  },
  ventesAnnuelles: [],
  isLoading: false,
  isError: false,
  message: '',
};


// --- Thunk Asynchrone Unique ---

/**
 * Thunk pour récupérer toutes les données du tableau de bord principal.
 */
export const fetchDashboardData = createAsyncThunk(
  'dashboard/fetchAll',
  async (_, thunkAPI) => {
    try {
      // Appelle la fonction optimisée du service
      return await dashboardService.getMainDashboardData();
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


// --- Création du Slice ---

export const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    resetDashboard: (state) => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.isLoading = true;
        state.isError = false;
        state.message = '';
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.isLoading = false;
        // On met à jour toutes les données du slice d'un seul coup
        // en utilisant le payload retourné par l'API.
        state.kpis = action.payload.kpis;
        state.ventesAnnuelles = action.payload.ventesAnnuelles;
        // Ajoutez d'autres données ici si le payload en contient
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;