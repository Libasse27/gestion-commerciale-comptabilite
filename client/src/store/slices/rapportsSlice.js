// client/src/store/slices/rapportsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import rapportsService from '../../services/rapportsService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

const sliceName = 'rapports'; // Utiliser un nom simple

// --- Thunks ---
export const fetchRapportVentes = createAsyncThunk(
  `${sliceName}/fetchVentes`,
  async (params, thunkAPI) => {
    try {
      return await rapportsService.getRapportVentes(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchRapportAchats = createAsyncThunk(
  `${sliceName}/fetchAchats`,
  async (params, thunkAPI) => {
    try {
      return await rapportsService.getRapportAchats(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchRapportStock = createAsyncThunk(
  `${sliceName}/fetchStock`,
  async (_, thunkAPI) => {
    try {
      return await rapportsService.getRapportStock();
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);


// --- Slice ---
const initialState = {
  rapportVentes: null,
  rapportAchats: null,
  rapportStock: null,
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
    },
  },
  extraReducers: (builder) => {
    builder
      // Rapport Ventes
      .addCase(fetchRapportVentes.fulfilled, (state, action) => {
        state.rapportVentes = action.payload;
      })
      // Rapport Achats
      .addCase(fetchRapportAchats.fulfilled, (state, action) => {
        state.rapportAchats = action.payload;
      })
      // Rapport Stock
      .addCase(fetchRapportStock.fulfilled, (state, action) => {
        state.rapportStock = action.payload;
      })

      // Matchers génériques
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