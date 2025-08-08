// client/src/store/slices/paiementsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paiementsService from '../../services/paiementsService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = 'paiements'; // Utiliser un nom simple

// --- Thunks ---
export const fetchPaiements = createAsyncThunk(
  `${sliceName}/fetchAll`,
  async (params, thunkAPI) => {
    try {
      return await paiementsService.getAllPaiements(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createEncaissement = createAsyncThunk(
  `${sliceName}/createEncaissement`,
  async (data, thunkAPI) => {
    try {
      return await paiementsService.createEncaissement(data);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

// --- Slice ---
const initialState = {
  paiements: [],
  pagination: {},
  status: 'idle',
  message: '',
};

export const paiementsSlice = createSlice({
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
      .addCase(fetchPaiements.fulfilled, (state, action) => {
        state.paiements = action.payload.data.paiements;
        state.pagination = action.payload.pagination;
      })
      .addCase(createEncaissement.fulfilled, (state, action) => {
        state.paiements.unshift(action.payload.paiement);
      })
      
      // Matchers génériques
      .addMatcher(
        (action) => action.type.startsWith(`${sliceName}/`) && action.type.endsWith('/pending'),
        (state) => { state.status = 'loading'; }
      )
      .addMatcher(
        (action) => action.type.startsWith(`${sliceName}/`) && action.type.endsWith('/fulfilled'),
        (state) => { state.status = 'succeeded'; }
      )
      .addMatcher(
        (action) => action.type.startsWith(`${sliceName}/`) && action.type.endsWith('/rejected'),
        (state, action) => { state.status = 'failed'; state.message = action.payload; }
      );
  },
});

export const { reset } = paiementsSlice.actions;
export default paiementsSlice.reducer;