// client/src/store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { getErrorMessage, getFromLocalStorage } from '../../utils/helpers';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';

// Lire l'état initial depuis le localStorage pour l'hydratation
const user = getFromLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO);
const token = getFromLocalStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

const initialState = {
  user: user || null,
  token: token || null,
  status: 'idle',
  message: '',
};

// --- Thunks ---
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try { return await authService.register(userData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try { return await authService.login(credentials); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const updateMyPassword = createAsyncThunk('auth/updateMyPassword', async (passwords, thunkAPI) => {
    try { return await authService.updateMyPassword(passwords); }
    catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async (email, thunkAPI) => {
    try { return await authService.requestPasswordReset(email); }
    catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (data, thunkAPI) => {
    try { return await authService.resetPassword(data.token, data.password); }
    catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

// --- Slice ---
export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.message = '';
    },
    logout: (state) => {
      // Le middleware interceptera cette action pour nettoyer le localStorage.
      authService.logout().catch(() => {});
      state.user = null;
      state.token = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(
        (action) => [login.fulfilled.type, register.fulfilled.type].includes(action.type),
        (state, action) => {
          state.status = 'succeeded';
          state.user = action.payload.user;
          state.token = action.payload.accessToken;
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.message = '';
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.message = action.payload;
          // Le logout sera probablement dispatché par l'intercepteur API,
          // mais c'est une sécurité de nettoyer l'état ici aussi.
          state.user = null;
          state.token = null;
        }
      )
      .addMatcher(
        (action) => [requestPasswordReset.fulfilled.type, resetPassword.fulfilled.type, updateMyPassword.fulfilled.type].includes(action.type),
        (state, action) => {
            state.status = 'succeeded';
            state.message = action.payload?.message || 'Opération réussie.';
        }
      );
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;