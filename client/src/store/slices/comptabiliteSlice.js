import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import comptabiliteService from '../../services/comptabiliteService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = REDUX_SLICE_NAMES.COMPTABILITE;

// Thunks
export const fetchPlanComptable = createAsyncThunk(/*...*/);
export const fetchJournaux = createAsyncThunk(`${sliceName}/fetchJournaux`, async (_, t) => { try { return await comptabiliteService.getAllJournaux(); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchEcritures = createAsyncThunk(/*...*/);
export const createEcriture = createAsyncThunk(/*...*/);
export const fetchBalanceGenerale = createAsyncThunk(/*...*/);
export const fetchGrandLivre = createAsyncThunk(/*...*/);
export const fetchBilan = createAsyncThunk(/*...*/);
export const fetchCompteDeResultat = createAsyncThunk(/*...*/);

const initialState = {
  planComptable: [], journaux: [], ecritures: [],
  balance: null, grandLivre: null, bilan: null, compteDeResultat: null,
  pagination: {}, status: 'idle', statusReports: 'idle', message: '',
};

export const comptabiliteSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: { /*...*/ },
  extraReducers: (builder) => {
    builder
      // Spécifiques
      .addCase(fetchPlanComptable.fulfilled, (state, action) => { state.planComptable = action.payload; })
      .addCase(fetchJournaux.fulfilled, (state, action) => { state.journaux = action.payload; })
      .addCase(fetchEcritures.fulfilled, (state, action) => {
        state.ecritures = action.payload.data.ecritures;
        state.pagination = action.payload.pagination;
      })
      .addCase(createEcriture.fulfilled, (state, action) => { state.ecritures.unshift(action.payload.ecriture); })
      .addCase(fetchBalanceGenerale.fulfilled, (state, action) => { state.balance = action.payload; })
      .addCase(fetchGrandLivre.fulfilled, (state, action) => { state.grandLivre = action.payload; })
      .addCase(fetchBilan.fulfilled, (state, action) => { state.bilan = action.payload; })
      .addCase(fetchCompteDeResultat.fulfilled, (state, action) => { state.compteDeResultat = action.payload; })
      
      // Génériques
      .addMatcher(/*...*/)
  },
});

export const { reset, resetReport } = comptabiliteSlice.actions;
export default comptabiliteSlice.reducer;