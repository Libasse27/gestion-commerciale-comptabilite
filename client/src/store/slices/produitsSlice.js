// client/src/store/slices/produitsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import produitsService from '../../services/produitsService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

// --- Thunks ---
export const fetchProduits = createAsyncThunk(`${REDUX_SLICE_NAMES.PRODUITS}/fetchAll`, async (params, thunkAPI) => {
  try { return await produitsService.getAllProduits(params); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const fetchProduitById = createAsyncThunk(`${REDUX_SLICE_NAMES.PRODUITS}/fetchById`, async (produitId, thunkAPI) => {
  try { return await produitsService.getProduitById(produitId); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const createProduit = createAsyncThunk(`${REDUX_SLICE_NAMES.PRODUITS}/create`, async (produitData, thunkAPI) => {
  try { return await produitsService.createProduit(produitData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const updateProduit = createAsyncThunk(`${REDUX_SLICE_NAMES.PRODUITS}/update`, async ({ produitId, updateData }, thunkAPI) => {
  try { return await produitsService.updateProduit(produitId, updateData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const deleteProduit = createAsyncThunk(`${REDUX_SLICE_NAMES.PRODUITS}/delete`, async (produitId, thunkAPI) => {
  try { await produitsService.deleteProduit(produitId); return produitId; }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const fetchCategories = createAsyncThunk(`${REDUX_SLICE_NAMES.CATEGORIES}/fetchAll`, async (_, thunkAPI) => {
  try { return await produitsService.getAllCategories(); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const createCategorie = createAsyncThunk(`${REDUX_SLICE_NAMES.CATEGORIES}/create`, async (categorieData, thunkAPI) => {
  try { return await produitsService.createCategorie(categorieData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});


// --- Slice ---
const initialState = {
  produits: [], produitCourant: null, categories: [],
  pagination: {}, status: 'idle', statusCategories: 'idle', message: '',
};

export const produitsSlice = createSlice({
  name: REDUX_SLICE_NAMES.PRODUITS,
  initialState,
  reducers: {
    reset: (state) => { state.status = 'idle'; state.statusCategories = 'idle'; state.message = ''; },
    clearCurrentProduit: (state) => { state.produitCourant = null; }
  },
  extraReducers: (builder) => {
    builder
      // Produits
      .addCase(fetchProduits.fulfilled, (state, action) => {
        state.produits = action.payload.data.produits;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProduitById.fulfilled, (state, action) => { state.produitCourant = action.payload; })
      .addCase(updateProduit.fulfilled, (state, action) => {
          const updated = action.payload;
          state.produits = state.produits.map(p => p._id === updated._id ? updated : p);
          if(state.produitCourant?._id === updated._id) state.produitCourant = updated;
      })
      .addCase(deleteProduit.fulfilled, (state, action) => {
          state.produits = state.produits.filter(p => p._id !== action.payload);
      })
      // Catégories
      .addCase(fetchCategories.pending, (state) => { state.statusCategories = 'loading'; })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.statusCategories = 'succeeded';
        state.categories = action.payload;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.statusCategories = 'failed';
        state.message = action.payload;
      })
      .addCase(createCategorie.fulfilled, (state, action) => {
          state.statusCategories = 'succeeded';
          state.categories.push(action.payload);
      })
      // Matchers génériques
      .addMatcher(
          (action) => action.type.startsWith('produits/') && action.type.endsWith('/pending'),
          (state) => { state.status = 'loading'; }
      )
      .addMatcher(
          (action) => action.type.startsWith('produits/') && action.type.endsWith('/fulfilled'),
          (state) => { state.status = 'succeeded'; }
      )
      .addMatcher(
          (action) => action.type.startsWith('produits/') && action.type.endsWith('/rejected'),
          (state, action) => { state.status = 'failed'; state.message = action.payload; }
      );
  },
});

export const { reset, clearCurrentProduit } = produitsSlice.actions;
export default produitsSlice.reducer;