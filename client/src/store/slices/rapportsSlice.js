import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import rapportsService from '../../services/rapportsService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = 'rapports';

// --- Thunks ---
export const fetchRapportVentes = createAsyncThunk(`${sliceName}/fetchVentes`, async (p, t) => { try { return await rapportsService.getRapportVentes(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchRapportAchats = createAsyncThunk(`${sliceName}/fetchAchats`, async (p, t) => { try { return await rapportsService.getRapportAchats(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchRapportStock = createAsyncThunk(`${sliceName}/fetchStock`, async (_, t) => { try { return await rapportsService.getRapportStock(); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchDeclarationTVA = createAsyncThunk(`${sliceName}/fetchTVA`, async (p, t) => { try { return await rapportsService.getDeclarationTVA(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});

// --- Slice ---
const initialState = {
  rapportVentes: null,
  rapportAchats: null,
  rapportStock: null,
  declarationTVA: null,
  status: 'idle',
  message: '',
};

export const rapportsSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.message = '';
      state.rapportVentes = null;
      state.rapportAchats = null;
      state.rapportStock = null;
      state.declarationTVA = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Spécifiques
      .addCase(fetchRapportVentes.fulfilled, (state, action) => { state.rapportVentes = action.payload; })
      .addCase(fetchRapportAchats.fulfilled, (state, action) => { state.rapportAchats = action.payload; })
      .addCase(fetchRapportStock.fulfilled, (state, action) => { state.rapportStock = action.payload; })
      .addCase(fetchDeclarationTVA.fulfilled, (state, action) => { state.declarationTVA = action.payload.declarationTVA; })
      
      // Génériques
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

export const { reset } = rapportsSlice.actions;
export default rapportsSlice.reducer;