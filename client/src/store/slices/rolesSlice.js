import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import rolesService from '../../services/rolesService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = REDUX_SLICE_NAMES.ROLES;

// --- Thunks ---
export const fetchRoles = createAsyncThunk(/*...*/);
export const fetchPermissions = createAsyncThunk(/*...*/);

// === AJOUTER CE THUNK ===
export const updateRole = createAsyncThunk(
  `${sliceName}/update`,
  async ({ roleId, updateData }, thunkAPI) => {
    try {
      return await rolesService.updateRole(roleId, updateData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);
// =========================


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
  reducers: { /*...*/ },
  extraReducers: (builder) => {
    builder
      // ... (cas existants)
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.status = 'failed';
        state.message = action.payload;
      })
      // === AJOUTER CE CAS ===
      .addCase(updateRole.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedRole = action.payload.role;
        // Mettre à jour le rôle dans la liste
        state.roles = state.roles.map(role => 
          role._id === updatedRole._id ? updatedRole : role
        );
      });
      // ======================
  },
});

export const { reset } = rolesSlice.actions;
export default rolesSlice.reducer;