// ==============================================================================
//           Slice Redux pour la Gestion de l'État du Tableau de Bord
//
// Ce slice est responsable de l'état des données affichées sur le tableau de
// bord principal.
//
// Il utilise un thunk unique `fetchDashboardData` pour récupérer toutes les
// données en un seul appel API, pour des performances de chargement optimales.
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import dashboardService from '../../services/dashboardService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

// --- État Initial ---
// L'état initial est plus simple. Il contient des valeurs par défaut
// pour les données que les composants attendent.
const initialState = {
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  // Les données seront peuplées par l'API. On peut garder des valeurs par défaut
  // pour éviter les erreurs `undefined` dans les composants au premier rendu.
  kpis: null,
  salesChart: null,
  previsionnelTresorerie: null,
  dernieresFacturesEnRetard: [],
};


// --- Thunk Asynchrone Unique ---

/**
 * Thunk pour récupérer toutes les données du tableau de bord principal.
 */
export const fetchDashboardData = createAsyncThunk(
  `${REDUX_SLICE_NAMES.DASHBOARD}/fetchAll`,
  async (_, thunkAPI) => {
    try {
      // Appelle la fonction optimisée du service qui fait un seul appel API.
      const response = await dashboardService.getMainDashboardData();
      // Le service retourne déjà la partie `data` de la réponse Axios.
      return response.data;
    } catch (error) {
      const message = getErrorMessage(error);
      return thunkAPI.rejectWithValue(message);
    }
  }
);


// --- Création du Slice ---

export const dashboardSlice = createSlice({
  name: REDUX_SLICE_NAMES.DASHBOARD,
  initialState,
  reducers: {
    // Action pour réinitialiser l'état du dashboard, utile lors de la déconnexion
    resetDashboard: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Mise à jour simplifiée : on fusionne l'objet `data` reçu de l'API
        // directement dans notre état. Si l'API ajoute une nouvelle clé, elle
        // sera automatiquement disponible dans le state.
        Object.assign(state, action.payload);
      })
      .addCase(fetchDashboardData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload; // Le message d'erreur est dans le payload
        // On réinitialise les données en cas d'erreur pour éviter d'afficher des données obsolètes.
        state.kpis = null;
        state.salesChart = null;
        state.previsionnelTresorerie = null;
        state.dernieresFacturesEnRetard = [];
      });
  },
});

export const { resetDashboard } = dashboardSlice.actions;
export default dashboardSlice.reducer;