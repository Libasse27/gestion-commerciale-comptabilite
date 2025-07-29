// ==============================================================================
//           Slice Redux pour la Gestion de l'État du Tableau de Bord
//
// Ce slice gère les données affichées sur le tableau de bord principal,
// comme les indicateurs de performance clés (KPIs) et les données pour
// les graphiques.
//
// Il utilise des thunks pour récupérer ces données de manière asynchrone
// via le `dashboardService`.
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


// --- Thunks Asynchrones ---

/**
 * Thunk pour récupérer les KPIs commerciaux.
 */
export const fetchKpis = createAsyncThunk(
  'dashboard/fetchKpis',
  async (_, thunkAPI) => {
    try {
      return await dashboardService.getKpisCommerciaux();
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);

/**
 * Thunk pour récupérer les données du graphique des ventes annuelles.
 */
export const fetchVentesAnnuelles = createAsyncThunk(
  'dashboard/fetchVentesAnnuelles',
  async (_, thunkAPI) => {
    try {
      return await dashboardService.getVentesAnnuelles();
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
      // --- Cas pour fetchKpis ---
      .addCase(fetchKpis.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchKpis.fulfilled, (state, action) => {
        state.isLoading = false;
        state.kpis = action.payload;
      })
      .addCase(fetchKpis.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })

      // --- Cas pour fetchVentesAnnuelles ---
      .addCase(fetchVentesAnnuelles.pending, (state) => {
        // On peut choisir de ne pas remettre isLoading à true si les KPIs
        // se chargent déjà, pour éviter un clignotement de l'UI.
        state.isLoading = true;
      })
      .addCase(fetchVentesAnnuelles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.ventesAnnuelles = action.payload;
      })
      .addCase(fetchVentesAnnuelles.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;