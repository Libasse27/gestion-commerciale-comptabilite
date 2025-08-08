// client/src/store/slices/paiementsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paiementsService from '../../services/paiementsService';
import { getErrorMessage } from '../../utils/helpers';

const sliceName = 'paiements';

// --- Thunks ---
export const fetchPaiements = createAsyncThunk(`${sliceName}/fetchPaiements`, async (p, t) => { /*...*/ });
export const createEncaissement = createAsyncThunk(`${sliceName}/createEncaissement`, async (d, t) => { /*...*/ });
export const fetchEcheances = createAsyncThunk(`${sliceName}/fetchEcheances`, async (p, t) => { try { return await paiementsService.getAllEcheances(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchRelances = createAsyncThunk(`${sliceName}/fetchRelances`, async (p, t) => { try { return await paiementsService.getAllRelances(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});

// --- Slice ---
const initialState = {
  paiements: [], echeances: [], relances: [],
  pagination: {}, status: 'idle', message: '',
};

export const paiementsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    reset: (state) => { state.status = 'idle'; state.message = ''; },
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
      .addCase(fetchEcheances.fulfilled, (state, action) => {
        state.echeances = action.payload.data.echeances;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchRelances.fulfilled, (state, action) => {
        state.relances = action.payload.data.relances;
        state.pagination = action.payload.pagination;
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