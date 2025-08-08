// client/src/store/slices/usersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import usersService from '../../services/usersService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = REDUX_SLICE_NAMES.USERS;

// --- Thunks ---
export const fetchUsers = createAsyncThunk(`${sliceName}/fetchAll`, async (p, t) => { try { return await usersService.getAllUsers(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
// Ajouter les autres thunks CRUD au besoin

// --- Slice ---
const initialState = {
  users: [],
  userCourant: null,
  pagination: {},
  status: 'idle',
  message: '',
};

export const usersSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    reset: (state) => { state.status = 'idle'; state.message = ''; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.users = action.payload.data.users;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.message = action.payload;
      });
  },
});

export const { reset } = usersSlice.actions;
export default usersSlice.reducer;