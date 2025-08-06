// client/src/store/slices/achatsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import achatsService from '../../services/achatsService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

// --- Thunks ---
export const fetchFacturesAchat = createAsyncThunk(
  `${REDUX_SLICE_NAMES.ACHATS}/fetchAll`,
  async (params, thunkAPI) => {
    try {
      return await achatsService.getAllFacturesAchat(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

// Ajouter les autres thunks CRUD (create, update, delete, getById) sur le même modèle

// --- Slice ---
const initialState = {
  facturesAchat: [],
  factureAchatCourante: null,
  pagination: {},
  status: 'idle',
  message: '',
};

export const achatsSlice = createSlice({
  name: REDUX_SLICE_NAMES.ACHATS,
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacturesAchat.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchFacturesAchat.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.facturesAchat = action.payload.data.facturesAchat; // Assumer que l'API renvoie ce format
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFacturesAchat.rejected, (state, action) => {
        state.status = 'failed';
        state.message = action.payload;
      });
  },
});

export const { reset } = achatsSlice.actions;
export default achatsSlice.reducer;