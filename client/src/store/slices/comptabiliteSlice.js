// client/src/store/slices/comptabiliteSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import comptabiliteService from '../../services/comptabiliteService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

// --- Thunks ---
export const fetchPlanComptable = createAsyncThunk(
  `${REDUX_SLICE_NAMES.COMPTABILITE}/fetchPlan`,
  async (_, thunkAPI) => {
    try {
      return await comptabiliteService.getPlanComptable();
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchEcritures = createAsyncThunk(
  `${REDUX_SLICE_NAMES.COMPTABILITE}/fetchEcritures`,
  async (params, thunkAPI) => {
    try {
      return await comptabiliteService.getAllEcritures(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

// --- Slice ---
const initialState = {
  planComptable: [],
  ecritures: [],
  pagination: {},
  status: 'idle',
  message: '',
};

export const comptabiliteSlice = createSlice({
  name: REDUX_SLICE_NAMES.COMPTABILITE,
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      // Plan Comptable
      .addCase(fetchPlanComptable.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchPlanComptable.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.planComptable = action.payload;
      })
      .addCase(fetchPlanComptable.rejected, (state, action) => {
        state.status = 'failed';
        state.message = action.payload;
      })
      // Écritures
      .addCase(fetchEcritures.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchEcritures.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.ecritures = action.payload.data.ecritures;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchEcritures.rejected, (state, action) => {
        state.status = 'failed';
        state.message = action.payload;
      });
  },
});

export const { reset } = comptabiliteSlice.actions;
export default comptabiliteSlice.reducer;