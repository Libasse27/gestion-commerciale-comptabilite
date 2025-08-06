// client/src/store/slices/clientsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import clientsService from '../../services/clientsService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

// --- Thunks ---
export const fetchClients = createAsyncThunk(
  `${REDUX_SLICE_NAMES.CLIENTS}/fetchAll`,
  async (params, thunkAPI) => {
    try { return await clientsService.getAllClients(params); }
    catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
  }
);

export const fetchClientById = createAsyncThunk(
  `${REDUX_SLICE_NAMES.CLIENTS}/fetchById`,
  async (clientId, thunkAPI) => {
    try { return await clientsService.getClientById(clientId); }
    catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
  }
);

export const createClient = createAsyncThunk(
  `${REDUX_SLICE_NAMES.CLIENTS}/create`,
  async (clientData, thunkAPI) => {
    try { return await clientsService.createClient(clientData); }
    catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
  }
);

export const updateClient = createAsyncThunk(
  `${REDUX_SLICE_NAMES.CLIENTS}/update`,
  async ({ clientId, updateData }, thunkAPI) => {
    try { return await clientsService.updateClient(clientId, updateData); }
    catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
  }
);

export const deleteClient = createAsyncThunk(
  `${REDUX_SLICE_NAMES.CLIENTS}/delete`,
  async (clientId, thunkAPI) => {
    try { await clientsService.deleteClient(clientId); return clientId; }
    catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
  }
);

export const fetchClientKpis = createAsyncThunk(
  `${REDUX_SLICE_NAMES.CLIENTS}/fetchKpis`,
  async (clientId, thunkAPI) => {
    try {
      return await clientsService.getClientKpis(clientId);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);


// --- Slice ---
const initialState = {
  clients: [],
  clientCourant: null,
  clientKpis: null,
  pagination: { page: 1, limit: 15, total: 0, pages: 1 },
  status: 'idle',
  statusKpis: 'idle',
  message: '',
};

export const clientsSlice = createSlice({
  name: REDUX_SLICE_NAMES.CLIENTS,
  initialState,
  reducers: {
    reset: (state) => { 
      state.status = 'idle'; 
      state.statusKpis = 'idle';
      state.message = ''; 
    },
    clearSelectedClient: (state) => {
      state.clientCourant = null;
      state.clientKpis = null;
      state.statusKpis = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      // CRUD Reducers
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = action.payload.data.clients;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clientCourant = action.payload.client;
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updated = action.payload; // Le service renvoie directement le client mis à jour
        state.clients = state.clients.map(c => (c._id === updated._id ? updated : c));
        if (state.clientCourant?._id === updated._id) {
          state.clientCourant = updated;
        }
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.clients = state.clients.filter(c => c._id !== action.payload);
      })
      .addCase(createClient.fulfilled, (state) => {
        state.status = 'succeeded'; // Pas besoin de modifier l'état, on re-fetchera la liste
      })
      // KPI Reducers
      .addCase(fetchClientKpis.pending, (state) => {
        state.statusKpis = 'loading';
      })
      .addCase(fetchClientKpis.fulfilled, (state, action) => {
        state.statusKpis = 'succeeded';
        state.clientKpis = action.payload.kpis;
      })
      .addCase(fetchClientKpis.rejected, (state, action) => {
        state.statusKpis = 'failed';
        state.message = action.payload;
      })
      // Generic Matchers for main CRUD status
      .addMatcher(
        (action) => action.type.startsWith('clients/') && !action.type.includes('Kpis') && action.type.endsWith('/pending'),
        (state) => { state.status = 'loading'; }
      )
      .addMatcher(
        (action) => action.type.startsWith('clients/') && !action.type.includes('Kpis') && action.type.endsWith('/rejected'),
        (state, action) => { state.status = 'failed'; state.message = action.payload; }
      );
  },
});

export const { reset, clearSelectedClient } = clientsSlice.actions;
export default clientsSlice.reducer;