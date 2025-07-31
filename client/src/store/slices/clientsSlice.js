// ==============================================================================
//           Slice Redux pour la Gestion de la Ressource "Clients" (Version Finale)
//
// Rôle : Gère l'état de la ressource "Client", y compris la liste, la pagination,
// et les opérations CRUD.
//
// Bonnes Pratiques :
// - Utilisation de `createAsyncThunk` pour encapsuler la logique asynchrone.
// - Utilisation de `addMatcher` pour réduire la duplication de code pour les
//   états `pending` et `rejected`.
// - Mise à jour optimiste de l'état après les opérations `create`, `update`, `delete`.
// ==============================================================================

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import clientsService from '../../services/clientsService';
import { getErrorMessage } from '../../utils/helpers';

// --- Thunks Asynchrones ---
// La logique des thunks reste la même.
export const fetchClients = createAsyncThunk('clients/fetchAll', async (params, thunkAPI) => {
  try { return await clientsService.getAll(params); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const fetchClientById = createAsyncThunk('clients/fetchById', async (id, thunkAPI) => {
  try { return await clientsService.getById(id); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const createClient = createAsyncThunk('clients/create', async (clientData, thunkAPI) => {
  try { return await clientsService.create(clientData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const updateClient = createAsyncThunk('clients/update', async ({ id, updateData }, thunkAPI) => {
  try { return await clientsService.update(id, updateData); }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});

export const deleteClient = createAsyncThunk('clients/delete', async (id, thunkAPI) => {
  try { await clientsService.remove(id); return id; }
  catch (error) { return thunkAPI.rejectWithValue(getErrorMessage(error)); }
});


// --- État Initial ---
const initialState = {
  items: [],              // La liste des clients actuellement affichée
  selectedClient: null,   // Les données du client pour la page de détail
  pagination: {},         // Les informations de pagination de l'API
  status: 'idle',         // 'idle' | 'loading' | 'succeeded' | 'failed'
  isError: false,
  message: '',
};


// --- Création du Slice ---
export const clientsSlice = createSlice({
  name: 'clients',
  initialState,
  reducers: {
    // Action pour réinitialiser les états d'erreur/message sans affecter les données
    resetStatus: (state) => {
      state.isError = false;
      state.message = '';
      state.status = 'idle';
    },
    // Action pour vider le client sélectionné, à appeler lors du "démontage" de la page de détail
    clearSelectedClient: (state) => {
        state.selectedClient = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // --- Cas "Fulfilled" spécifiques ---
      .addCase(fetchClients.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // La réponse de l'API doit contenir .data et .pagination
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchClientById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.selectedClient = action.payload.data;
      })
      .addCase(createClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Ajoute le nouveau client en haut de la liste pour un retour visuel immédiat
        state.items.unshift(action.payload.data);
      })
      .addCase(updateClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updatedClient = action.payload.data;
        // Met à jour le client dans la liste
        const index = state.items.findIndex(client => client._id === updatedClient._id);
        if (index !== -1) {
          state.items[index] = updatedClient;
        }
        // Met également à jour le client sélectionné si c'est le même
        if (state.selectedClient?._id === updatedClient._id) {
          state.selectedClient = updatedClient;
        }
      })
      .addCase(deleteClient.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // action.payload contient l'ID retourné par le thunk
        state.items = state.items.filter(client => client._id !== action.payload);
      })

      // --- Matchers génériques pour `pending` et `rejected` ---
      // Ceci s'applique à TOUS les thunks ci-dessus, évitant la duplication de code.
      .addMatcher(
        (action) => action.type.startsWith('clients/') && action.type.endsWith('/pending'),
        (state) => {
          state.status = 'loading';
          state.isError = false; // Réinitialise l'erreur au début d'une nouvelle requête
        }
      )
      .addMatcher(
        (action) => action.type.startsWith('clients/') && action.type.endsWith('/rejected'),
        (state, action) => {
          state.status = 'failed';
          state.isError = true;
          state.message = action.payload; // Le message d'erreur est fourni par `rejectWithValue`
        }
      );
  },
});

// --- Exportations ---
export const { resetStatus, clearSelectedClient } = clientsSlice.actions;

// Sélecteurs pour une utilisation propre dans les composants
export const selectAllClients = (state) => state.clients.items;
export const selectClientById = (state) => state.clients.selectedClient;
export const selectClientsPagination = (state) => state.clients.pagination;
export const selectClientsStatus = (state) => state.clients.status;

export default clientsSlice.reducer;