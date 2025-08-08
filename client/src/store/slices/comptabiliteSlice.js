import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import comptabiliteService from '../../services/comptabiliteService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = REDUX_SLICE_NAMES.COMPTABILITE;

// --- Thunks ---
export const fetchPlanComptable = createAsyncThunk(`${sliceName}/fetchPlan`, async (_, t) => { try { return await comptabiliteService.getPlanComptable(); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchJournaux = createAsyncThunk(`${sliceName}/fetchJournaux`, async (_, t) => { try { return await comptabiliteService.getAllJournaux(); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const createJournal = createAsyncThunk(`${sliceName}/createJournal`, async (data, t) => { try { return await comptabiliteService.createJournal(data); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchEcritures = createAsyncThunk(`${sliceName}/fetchEcritures`, async (p, t) => { try { return await comptabiliteService.getAllEcritures(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const createEcriture = createAsyncThunk(`${sliceName}/createEcriture`, async (data, t) => { try { return await comptabiliteService.createEcriture(data); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const validerEcriture = createAsyncThunk(`${sliceName}/validerEcriture`, async (id, t) => { try { return await comptabiliteService.validerEcriture(id); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchBalanceGenerale = createAsyncThunk(`${sliceName}/fetchBalance`, async (p, t) => { try { return await comptabiliteService.getBalanceGenerale(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchGrandLivre = createAsyncThunk(`${sliceName}/fetchGrandLivre`, async (p, t) => { try { return await comptabiliteService.getGrandLivre(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchBilan = createAsyncThunk(`${sliceName}/fetchBilan`, async (dateFin, t) => { try { return await comptabiliteService.getBilan(dateFin); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchCompteDeResultat = createAsyncThunk(`${sliceName}/fetchCompteDeResultat`, async (p, t) => { try { return await comptabiliteService.getCompteDeResultat(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});

// --- Slice ---
const initialState = {
  planComptable: [], journaux: [], ecritures: [],
  balance: null, grandLivre: null, bilan: null, compteDeResultat: null,
  pagination: {}, status: 'idle', statusReports: 'idle', message: '',
};

export const comptabiliteSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.message = '';
    },
    resetReport: (state) => {
      state.statusReports = 'idle';
      state.balance = null;
      state.grandLivre = null;
      state.bilan = null;
      state.compteDeResultat = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Cas spécifiques `fulfilled`
      .addCase(fetchPlanComptable.fulfilled, (state, action) => { state.planComptable = action.payload; })
      .addCase(fetchJournaux.fulfilled, (state, action) => { state.journaux = action.payload; })
      .addCase(createJournal.fulfilled, (state, action) => { state.journaux.push(action.payload); })
      .addCase(fetchEcritures.fulfilled, (state, action) => {
        state.ecritures = action.payload.data.ecritures;
        state.pagination = action.payload.pagination;
      })
      .addCase(createEcriture.fulfilled, (state, action) => { state.ecritures.unshift(action.payload.ecriture); })
      .addCase(validerEcriture.fulfilled, (state, action) => {
          const updated = action.payload.ecriture;
          state.ecritures = state.ecritures.map(e => e._id === updated._id ? updated : e);
      })
      .addCase(fetchBalanceGenerale.fulfilled, (state, action) => { state.balance = action.payload; })
      .addCase(fetchGrandLivre.fulfilled, (state, action) => { state.grandLivre = action.payload; })
      .addCase(fetchBilan.fulfilled, (state, action) => { state.bilan = action.payload; })
      .addCase(fetchCompteDeResultat.fulfilled, (state, action) => { state.compteDeResultat = action.payload; })
      
      // Matchers génériques pour les statuts
      .addMatcher(
        (action) => action.type.startsWith(sliceName) && action.type.endsWith('/pending'),
        (state, action) => {
          if (action.type.includes('Balance') || action.type.includes('Bilan') || action.type.includes('GrandLivre') || action.type.includes('CompteDeResultat')) {
            state.statusReports = 'loading';
          } else {
            state.status = 'loading';
          }
        }
      )
      .addMatcher(
        (action) => action.type.startsWith(sliceName) && action.type.endsWith('/fulfilled'),
        (state, action) => {
          if (action.type.includes('Balance') || action.type.includes('Bilan') || action.type.includes('GrandLivre') || action.type.includes('CompteDeResultat')) {
            state.statusReports = 'succeeded';
          } else {
            state.status = 'succeeded';
          }
        }
      )
      .addMatcher(
        (action) => action.type.startsWith(sliceName) && action.type.endsWith('/rejected'),
        (state, action) => {
          if (action.type.includes('Balance') || action.type.includes('Bilan') || action.type.includes('GrandLivre') || action.type.includes('CompteDeResultat')) {
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