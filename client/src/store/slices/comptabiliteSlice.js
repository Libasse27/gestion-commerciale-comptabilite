// client/src/store/slices/comptabiliteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import comptabiliteService from '../../services/comptabiliteService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = REDUX_SLICE_NAMES.COMPTABILITE;

// --- Thunks ---
export const fetchPlanComptable = createAsyncThunk(`${sliceName}/fetchPlan`, async (_, t) => { try { return await comptabiliteService.getPlanComptable(); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchEcritures = createAsyncThunk(`${sliceName}/fetchEcritures`, async (p, t) => { try { return await comptabiliteService.getAllEcritures(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const createEcriture = createAsyncThunk(`${sliceName}/createEcriture`, async (data, t) => { try { return await comptabiliteService.createEcriture(data); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const validerEcriture = createAsyncThunk(`${sliceName}/validerEcriture`, async (id, t) => { try { return await comptabiliteService.validerEcriture(id); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchBalanceGenerale = createAsyncThunk(`${sliceName}/fetchBalance`, async (p, t) => { try { return await comptabiliteService.getBalanceGenerale(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchGrandLivre = createAsyncThunk(`${sliceName}/fetchGrandLivre`, async (p, t) => { try { return await comptabiliteService.getGrandLivre(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchBilan = createAsyncThunk(`${sliceName}/fetchBilan`, async (dateFin, t) => { try { return await comptabiliteService.getBilan(dateFin); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchCompteDeResultat = createAsyncThunk(`${sliceName}/fetchCompteDeResultat`, async (p, t) => { try { return await comptabiliteService.getCompteDeResultat(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});

// --- Slice ---
const initialState = {
  planComptable: [], ecritures: [], balance: null, grandLivre: null, bilan: null, compteDeResultat: null,
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
      .addCase(fetchEcritures.fulfilled, (state, action) => { /*...*/ })
      .addCase(createEcriture.fulfilled, (state, action) => { state.ecritures.unshift(action.payload.ecriture); })
      .addCase(fetchBalanceGenerale.fulfilled, (state, action) => { state.balance = action.payload; })
      .addCase(fetchGrandLivre.fulfilled, (state, action) => { state.grandLivre = action.payload; })
      .addCase(fetchBilan.fulfilled, (state, action) => { state.bilan = action.payload; })
      .addCase(fetchCompteDeResultat.fulfilled, (state, action) => { state.compteDeResultat = action.payload.compteDeResultat; })
      
      // Génériques
      .addMatcher(/*...*/)
  },
});

export const { reset, resetReport } = comptabiliteSlice.actions;
export default comptabiliteSlice.reducer;