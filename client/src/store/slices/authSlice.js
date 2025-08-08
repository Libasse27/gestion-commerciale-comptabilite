import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';
import { getErrorMessage, getFromLocalStorage } from '../../utils/helpers';
import { LOCAL_STORAGE_KEYS } from '../../utils/constants';

const user = getFromLocalStorage(LOCAL_STORAGE_KEYS.USER_INFO);
const token = getFromLocalStorage(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

const initialState = {
  user: user || null,
  token: token || null,
  status: 'idle', // idle | loading | succeeded | failed
  message: '',
};

// --- Thunks ---
export const register = createAsyncThunk('auth/register', async (userData, thunkAPI) => {
  try {
    return await authService.register(userData);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const login = createAsyncThunk('auth/login', async (credentials, thunkAPI) => {
  try {
    return await authService.login(credentials);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const updateMyPassword = createAsyncThunk('auth/updateMyPassword', async (passwords, thunkAPI) => {
  try {
    return await authService.updateMyPassword(passwords);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async (email, thunkAPI) => {
  try {
    return await authService.requestPasswordReset(email);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async ({ token, password }, thunkAPI) => {
  try {
    return await authService.resetPassword(token, password);
  } catch (error) {
    return thunkAPI.rejectWithValue(getErrorMessage(error));
  }
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
      authService.logout().catch(() => {});
      state.user = null;
      state.token = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    // ✅ login et register success
    builder.addCase(login.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
    });

    builder.addCase(register.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
    });

    // ✅ Autres success (message-only)
    builder.addCase(requestPasswordReset.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.message = action.payload?.message || 'E-mail de réinitialisation envoyé.';
    });

    builder.addCase(resetPassword.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.message = action.payload?.message || 'Mot de passe réinitialisé avec succès.';
    });

    builder.addCase(updateMyPassword.fulfilled, (state, action) => {
      state.status = 'succeeded';
      state.message = action.payload?.message || 'Mot de passe mis à jour.';
    });

    // ✅ pending
    builder.addMatcher(
      (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending'),
      (state) => {
        state.status = 'loading';
        state.message = '';
      }
    );

    // ✅ rejected
    builder.addMatcher(
      (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected'),
      (state, action) => {
        state.status = 'failed';
        state.message = action.payload || 'Erreur inconnue.';
        state.user = null;
        state.token = null;
      }
    );
  },
});

export const { reset, logout } = authSlice.actions;
export default authSlice.reducer;
