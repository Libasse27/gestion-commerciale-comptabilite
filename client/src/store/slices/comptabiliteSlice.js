// client/src/store/slices/comptabiliteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import comptabiliteService from '../../services/comptabiliteService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = REDUX_SLICE_NAMES.COMPTABILITE;

// --- Thunks ---
export const fetchPlanComptable = createAsyncThunk(`${sliceName}/fetchPlan`, async (_, t) => { try { return await comptabiliteService.getPlanComptable(); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchEcritures = createAsyncThunk(`${sliceName}/fetchEcritures`, async (p, t) => { try { return await comptabiliteService.getAllEcritures(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchBalanceGenerale = createAsyncThunk(`${sliceName}/fetchBalance`, async (p, t) => { try { return await comptabiliteService.getBalanceGenerale(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchGrandLivre = createAsyncThunk(`${sliceName}/fetchGrandLivre`, async (p, t) => { try { return await comptabiliteService.getGrandLivre(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchBilan = createAsyncThunk(`${sliceName}/fetchBilan`, async (dateFin, t) => { try { return await comptabiliteService.getBilan(dateFin); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});

// --- Slice ---
const initialState = {
  planComptable: [], ecritures: [], balance: null, grandLivre: null, bilan: null,
  pagination: {}, status: 'idle', statusReports: 'idle', message: '',
};

export const comptabiliteSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    reset: (state) => { /* ... */ },
    resetReport: (state) => { /* ... */ }
  },
  extraReducers: (builder) => {
    builder
      // Spécifiques
      .addCase(fetchPlanComptable.fulfilled, (state, action) => { state.planComptable = action.payload; })
      .addCase(fetchEcritures.fulfilled, (state, action) => {
        state.ecritures = action.payload.data.ecritures;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBalanceGenerale.fulfilled, (state, action) => { state.balance = action.payload; })
      .addCase(fetchGrandLivre.fulfilled, (state, action) => { state.grandLivre = action.payload; })
      .addCase(fetchBilan.fulfilled, (state, action) => { state.bilan = action.payload; })
      
      // Génériques
      .addMatcher(
        (action) => action.type.startsWith(sliceName) && action.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('Balance') || action.type.includes('Bilan') || action.type.includes('GrandLivre')) {
            state.statusReports = 'loading';
          } else {
            state.status = 'loading';
          }
        }
      )
      .addMatcher(
        (action) => action.type.startsWith(sliceName) && action.type.endsWith('/fulfilled'),
        (state, action) => {
          if (action.type.includes('Balance') || action.type.includes('Bilan') || action.type.includes('GrandLivre')) {
            state.statusReports = 'succeeded';
          } else {
            state.status = 'succeeded';
          }
        }
      )
      .addMatcher(
        (action) => action.type.startsWith(sliceName) && action.type.endsWith('/rejected'),
        (state, action) => {
          if (action.type.includes('Balance') || action.type.includes('Bilan') || action.type.includes('GrandLivre')) {
            state.statusReports = 'failed';
          } else {
            state.status = 'failed';
          }
          state.message = action.payload;
        }
      );
  },
});

export const { reset, resetReport } = comptabiliteSlice.actions;
export default comptabiliteSlice.reducer;