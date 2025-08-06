// client/src/store/slices/ventesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ventesService from '../../services/ventesService';
import { getErrorMessage } from '../../utils/helpers';

const sliceName = 'ventes';

// --- Thunks ---
export const fetchDevis = createAsyncThunk(`${sliceName}/fetchDevis`, async (p, t) => { try { return await ventesService.getAllDevis(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const createDevis = createAsyncThunk(`${sliceName}/createDevis`, async (data, t) => { try { return await ventesService.createDevis(data); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchCommandes = createAsyncThunk(`${sliceName}/fetchCommandes`, async (p, t) => { try { return await ventesService.getAllCommandes(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchFactures = createAsyncThunk(`${sliceName}/fetchFactures`, async (p, t) => { try { return await ventesService.getAllFactures(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchFactureById = createAsyncThunk(`${sliceName}/fetchFactureById`, async (id, t) => { try { return await ventesService.getFactureById(id); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchBonLivraisonById = createAsyncThunk(`${sliceName}/fetchBonLivraisonById`, async (id, t) => { try { return await ventesService.getBonLivraisonById(id); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});

// --- Slice ---
const initialState = {
  devis: [], commandes: [], factures: [], factureCourante: null, bonLivraisonCourant: null,
  pagination: {}, status: 'idle', message: '',
};

export const ventesSlice = createSlice({
  name: sliceName,
  initialState,
  reducers: {
    reset: (state) => { state.status = 'idle'; state.message = ''; },
  },
  extraReducers: (builder) => {
    builder
      // Devis
      .addCase(fetchDevis.fulfilled, (state, action) => {
        state.devis = action.payload.data.devis;
        state.pagination = action.payload.pagination;
      })
      // Commandes
      .addCase(fetchCommandes.fulfilled, (state, action) => {
        state.commandes = action.payload.data.commandes;
        state.pagination = action.payload.pagination;
      })
      // Factures
      .addCase(fetchFactures.fulfilled, (state, action) => {
        state.factures = action.payload.data.factures;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFactureById.fulfilled, (state, action) => {
        state.factureCourante = action.payload.facture;
      })
      // BL
      .addCase(fetchBonLivraisonById.fulfilled, (state, action) => {
          state.bonLivraisonCourant = action.payload.bonLivraison;
      })
      // Matchers génériques
      .addMatcher(
        (action) => action.type.startsWith(sliceName) && action.type.endsWith('/pending'),
        (state) => { state.status = 'loading'; }
      )
      .addMatcher(
        (action) => action.type.startsWith(sliceName) && action.type.endsWith('/fulfilled'),
        (state) => { state.status = 'succeeded'; }
      )
      .addMatcher(
        (action) => action.type.startsWith(sliceName) && action.type.endsWith('/rejected'),
        (state, action) => { state.status = 'failed'; state.message = action.payload; }
      );
  },
});

export const { reset } = ventesSlice.actions;
export default ventesSlice.reducer;