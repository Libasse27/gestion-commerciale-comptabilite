// client/src/store/slices/stockSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import stockService from '../../services/stockService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

// --- Thunks Définis Correctement ---
export const fetchDepots = createAsyncThunk(`${REDUX_SLICE_NAMES.STOCK}/fetchDepots`, async (_, thunkAPI) => {
  try { return await stockService.getAllDepots(); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const createDepot = createAsyncThunk(`${REDUX_SLICE_NAMES.STOCK}/createDepot`, async (depotData, thunkAPI) => {
  try { return await stockService.createDepot(depotData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const fetchEtatStock = createAsyncThunk(`${REDUX_SLICE_NAMES.STOCK}/fetchEtatStock`, async (params, thunkAPI) => {
  try { return await stockService.getEtatStockGlobal(params); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const fetchMouvementsProduit = createAsyncThunk(`${REDUX_SLICE_NAMES.STOCK}/fetchMouvements`, async ({ produitId, params }, thunkAPI) => {
  try { return await stockService.getHistoriqueProduit(produitId, params); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const fetchInventaires = createAsyncThunk(`${REDUX_SLICE_NAMES.STOCK}/fetchInventaires`, async (params, thunkAPI) => {
  try { return await stockService.getAllInventaires(params); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const startInventaire = createAsyncThunk(`${REDUX_SLICE_NAMES.STOCK}/startInventaire`, async (depotId, thunkAPI) => {
  try { return await stockService.startInventaire(depotId); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const fetchAlertes = createAsyncThunk(`${REDUX_SLICE_NAMES.STOCK}/fetchAlertes`, async (params, thunkAPI) => {
  try { return await stockService.getAllAlertes(params); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});


// --- Slice ---
const initialState = {
  depots: [], etatsStock: [], mouvements: [], inventaires: [],
  alertes: [], pagination: {}, status: 'idle', statusDepots: 'idle',
  statusMouvements: 'idle', statusInventaires: 'idle', statusAlertes: 'idle', message: '',
};

export const stockSlice = createSlice({
  name: REDUX_SLICE_NAMES.STOCK,
  initialState,
  reducers: { /* ... */ },
  extraReducers: (builder) => {
    builder
      // Dépôts
      .addCase(fetchDepots.pending, (state) => { state.statusDepots = 'loading'; })
      .addCase(fetchDepots.fulfilled, (state, action) => {
        state.statusDepots = 'succeeded';
        state.depots = action.payload.data.depots;
      })
      .addCase(createDepot.fulfilled, (state, action) => {
        state.statusDepots = 'succeeded';
        state.depots.push(action.payload.depot);
      })
      
      // État du Stock
      .addCase(fetchEtatStock.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchEtatStock.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.etatsStock = action.payload.data.etatsStock;
        state.pagination = action.payload.pagination;
      })
      
      // Mouvements
      .addCase(fetchMouvementsProduit.pending, (state) => { state.statusMouvements = 'loading'; })
      .addCase(fetchMouvementsProduit.fulfilled, (state, action) => {
          state.statusMouvements = 'succeeded';
          state.mouvements = action.payload.mouvements;
          state.pagination = action.payload;
      })
      
      // Inventaires
      .addCase(fetchInventaires.pending, (state) => { state.statusInventaires = 'loading'; })
      .addCase(fetchInventaires.fulfilled, (state, action) => {
          state.statusInventaires = 'succeeded';
          state.inventaires = action.payload.data.inventaires;
      })
      .addCase(startInventaire.fulfilled, (state, action) => {
          state.statusInventaires = 'succeeded';
          state.inventaires.unshift(action.payload);
      })

      // Alertes
      .addCase(fetchAlertes.pending, (state) => { state.statusAlertes = 'loading'; })
      .addCase(fetchAlertes.fulfilled, (state, action) => {
          state.statusAlertes = 'succeeded';
          state.alertes = action.payload.data.alertes;
      })

      // Matchers génériques
      .addMatcher(
          (action) => action.type.startsWith('stock/') && action.type.endsWith('/rejected'),
          (state, action) => {
              if(action.type.includes('Depot')) state.statusDepots = 'failed';
              else if(action.type.includes('EtatStock')) state.status = 'failed';
              else if(action.type.includes('Mouvements')) state.statusMouvements = 'failed';
              else if(action.type.includes('Inventaires')) state.statusInventaires = 'failed';
              else if(action.type.includes('Alertes')) state.statusAlertes = 'failed';
              state.message = action.payload;
          }
      )
  },
});

export const { reset } = stockSlice.actions;
export default stockSlice.reducer;