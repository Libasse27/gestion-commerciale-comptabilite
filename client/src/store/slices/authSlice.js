// ==============================================================================
//           Slice Redux pour la Gestion de l'Authentification
//
// Ce slice est la SEULE source de vérité pour l'état d'authentification.
// Toute interaction avec le localStorage (lecture, écriture, suppression)
// est gérée ICI et NULLE PART AILLEURS, en réponse aux actions.
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { getErrorMessage, getFromLocalStorage, saveToLocalStorage, removeFromLocalStorage } from '../../utils/helpers';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';

// --- État Initial ---
// L'état initial est lu directement depuis le localStorage.
const userInfoFromStorage = getFromLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO);

const initialState = {
  user: userInfoFromStorage ? userInfoFromStorage : null,
  token: userInfoFromStorage ? userInfoFromStorage.token : null,
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  isSuccess: false,
  isError: false,
  message: '',
};

// --- Thunks Asynchrones ---
// Chaque thunk délègue l'appel API au service et gère les erreurs.
export const registerUser = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try { return await authService.register(userData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const loginUser = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try { return await authService.login(credentials); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const requestPasswordReset = createAsyncThunk('auth/forgotPassword', async (email, thunkAPI) => {
  try { return await authService.requestPasswordReset(email); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const resetUserPassword = createAsyncThunk('auth/resetPassword', async (data, thunkAPI) => {
  try { return await authService.resetPassword(data.token, data.password); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});


// --- Création du Slice ---
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Action pour réinitialiser les états temporaires (isSuccess, isError, etc.)
    reset: (state) => {
      state.status = 'idle';
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // Action de déconnexion
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.status = 'idle';
      removeFromLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO);
    },
  },
  extraReducers: (builder) => {
    builder
      // --- Cas de succès spécifiques (qui ne modifient pas l'état d'auth) ---
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.message = action.payload.message;
      })
      .addCase(resetUserPassword.fulfilled, (state, action) => {
        state.isSuccess = true;
        state.message = action.payload.message;
      })

      // --- Cas génériques via `addMatcher` pour éviter la duplication ---
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.isSuccess = false;
          state.isError = false;
          state.message = '';
        }
      )
      .addMatcher(
        // Cible uniquement les actions de login et register réussies
        (action) => action.type === loginUser.fulfilled.type || action.type === registerUser.fulfilled.type,
        (state, action) => {
          const user = action.payload.user;
          const token = action.payload.accessToken;

          // Créer l'objet à stocker
          const userInfo = { ...user, token };

          // Mettre à jour l'état Redux
          state.status = 'succeeded';
          state.isSuccess = true;
          state.user = user;
          state.token = token;

          // Mettre à jour le localStorage
          saveToLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO, userInfo);
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.isError = true;
          state.message = action.payload; // Le message vient de rejectWithValue
          state.user = null;
          state.token = null;

          // Nettoyer le localStorage en cas d'échec d'authentification
          removeFromLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO);
        }
      );
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;