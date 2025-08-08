// client/src/store/slices/rolesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import rolesService from '../../services/rolesService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = REDUX_SLICE_NAMES.ROLES;

// --- Thunks ---
export const fetchRoles = createAsyncThunk(
  `${sliceName}/fetchAll`,
  async (_, thunkAPI) => {
    try {
      return await rolesService.getAllRoles();
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchPermissions = createAsyncThunk(
  `${sliceName}/fetchPermissions`,
  async (_, thunkAPI) => {
    try {
      return await rolesService.getAllPermissions();
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

// Ajouter les autres thunks CRUD au besoin

// --- Slice ---
const initialState = {
  roles: [],
  permissions: {},
  status: 'idle',
  message: '',
};

export const rolesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Rôles
      .addCase(fetchRoles.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.roles = action.payload;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.status = 'failed';
        state.message = action.payload;
      })
      // Permissions
      .addCase(fetchPermissions.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.status = 'failed';
        state.message = action.payload;
      });
  },
});

export const { reset } = rolesSlice.actions;
export default rolesSlice.reducer;