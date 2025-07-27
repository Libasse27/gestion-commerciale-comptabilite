// ==============================================================================
//           Slice Redux pour la Gestion de l'Authentification
//
// Ce slice gère l'état lié à l'authentification de l'utilisateur, y compris
// les informations de l'utilisateur, le token d'accès, et les états de
// chargement/erreur pour les opérations d'authentification.
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { getErrorMessage } from '../../utils/helpers';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';

// --- État Initial ---
// Essayer de récupérer les informations de l'utilisateur depuis le localStorage
// pour maintenir la session après un rechargement de la page.
const user = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEYS.USER_INFO));
const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

const initialState = {
  user: user || null,
  token: token || null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};


// --- Thunks Asynchrones (pour les appels API) ---

/**
 * Thunk pour gérer la connexion de l'utilisateur.
 * Il appellera le `authService.login` et gérera automatiquement les
 * actions `pending`, `fulfilled`, et `rejected`.
 */
export const login = createAsyncThunk(
  'auth/login', // Nom de l'action
  async (credentials, thunkAPI) => {
    try {
      // L'appel API est délégué au service d'authentification
      return await authService.login(credentials);
    } catch (error) {
      const message = getErrorMessage(error);
      // `rejectWithValue` enverra le message d'erreur dans le payload de l'action `rejected`.
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// TODO: Créer un thunk pour l'inscription (register) sur le même modèle.
// export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => { ... });


// --- Création du Slice ---

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  
  // Reducers pour les actions synchrones
  reducers: {
    /**
     * Action pour réinitialiser l'état (utile pour nettoyer les erreurs).
     */
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    /**
     * Action de déconnexion.
     * C'est une action synchrone car elle ne fait que nettoyer l'état local.
     * L'effet de bord (nettoyer le localStorage) sera géré par `authMiddleware`.
     */
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
  },

  // Reducers pour les actions asynchrones (gérées par les thunks)
  extraReducers: (builder) => {
    builder
      // Cas pour la connexion (login)
      .addCase(login.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.user = action.payload.user;
        state.token = action.payload.accessToken;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload; // Le message d'erreur vient de `rejectWithValue`
        state.user = null;
        state.token = null;
      })
      
      // TODO: Ajouter les cas pour l'inscription (register) ici
      // .addCase(register.pending, ...)
      // .addCase(register.fulfilled, ...)
      // .addCase(register.rejected, ...)
  },
});

// --- Exportation des Actions et du Reducer ---

// Exporte les actions synchrones pour pouvoir les utiliser dans les composants
export const { reset, logout } = authSlice.actions;

// Exporte le reducer pour l'ajouter au store
export default authSlice.reducer;