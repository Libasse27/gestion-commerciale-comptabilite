// ==============================================================================
//           Slice Redux pour la Gestion de l'Authentification (Version Finale)
//
// Gère l'intégralité du cycle de vie de l'authentification.
// La logique de réinitialisation des états (isSuccess, isError) est maintenant
// gérée automatiquement par le matcher '/pending', ce qui évite les boucles
// de rendu infinies dans les composants.
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { getErrorMessage } from '../../utils/helpers';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';

// --- État Initial ---
const getUserFromStorage = () => {
  try {
    const userString = localStorage.getItem(LOCAL_STORAGE_KEYS.USER_INFO);
    if (userString && userString !== 'undefined') return JSON.parse(userString);
    return null;
  } catch (error) {
    return null;
  }
};
const user = getUserFromStorage();
const token = localStorage.getItem(LOCAL_STORAGE_KEYS.AUTH_TOKEN);

const initialState = {
  user: user || null,
  token: token || null,
  isLoading: false,
  isSuccess: false,
  isError: false,
  message: '',
};


// --- Thunks Asynchrones ---
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try { return await authService.register(userData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try { return await authService.login(credentials); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const forgotPassword = createAsyncThunk('auth/forgotPassword', async (email, thunkAPI) => {
  try { return await authService.requestPasswordReset(email); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (data, thunkAPI) => {
  try { return await authService.resetPassword(data.token, data.password); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});


// --- Création du Slice ---
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action manuelle pour réinitialiser les états, si nécessaire dans un composant.
    reset: (state) => {
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
    },
    tokenRefreshed: (state, action) => {
      state.token = action.payload.accessToken;
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Cas spécifiques pour les succès (`fulfilled`) ---
      .addCase(register.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.user = action.payload.data.user;
        state.token = action.payload.accessToken;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.user = action.payload.data.user;
        state.token = action.payload.accessToken;
      })
      .addCase(forgotPassword.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(resetPassword.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.message = action.payload.message;
      })

      // --- Cas génériques pour tous les Thunks ---
      // NOTE: Les matchers doivent être à la fin.
      .addMatcher(
        (action) => action.type.endsWith('/pending'),
        (state) => {
          // Au début de chaque appel, on met isLoading à true
          // et on réinitialise les états de succès/erreur.
          state.isLoading = true;
          state.isSuccess = false;
          state.isError = false;
          state.message = '';
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/fulfilled'),
        (state) => {
          // À la fin de chaque appel réussi, on remet isLoading à false.
          state.isLoading = false;
        }
      )
      .addMatcher(
        (action) => action.type.endsWith('/rejected'),
        (state, action) => {
          // À la fin de chaque appel échoué, on stocke l'erreur.
          state.isLoading = false;
          state.isError = true;
          state.message = action.payload;
          // En cas d'échec d'authentification, on s'assure que l'utilisateur est déconnecté.
          if (action.type.startsWith('auth/')) {
            state.user = null;
            state.token = null;
          }
        }
      );
  },
});

export const { reset, logout, tokenRefreshed } = authSlice.actions;
export default authSlice.reducer;