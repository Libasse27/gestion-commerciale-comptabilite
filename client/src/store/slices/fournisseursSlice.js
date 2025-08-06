// client/src/store/slices/fournisseursSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import fournisseursService from '../../services/fournisseursService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

// --- Thunks ---
export const fetchFournisseurs = createAsyncThunk(
  `${REDUX_SLICE_NAMES.FOURNISSEURS}/fetchAll`,
  async (params, thunkAPI) => {
    try {
      return await fournisseursService.getAllFournisseurs(params);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const fetchFournisseurById = createAsyncThunk(
  `${REDUX_SLICE_NAMES.FOURNISSEURS}/fetchById`,
  async (fournisseurId, thunkAPI) => {
    try {
      return await fournisseursService.getFournisseurById(fournisseurId);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const createFournisseur = createAsyncThunk(
  `${REDUX_SLICE_NAMES.FOURNISSEURS}/create`,
  async (fournisseurData, thunkAPI) => {
    try {
      return await fournisseursService.createFournisseur(fournisseurData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const updateFournisseur = createAsyncThunk(
  `${REDUX_SLICE_NAMES.FOURNISSEURS}/update`,
  async ({ fournisseurId, updateData }, thunkAPI) => {
    try {
      return await fournisseursService.updateFournisseur(fournisseurId, updateData);
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

export const deleteFournisseur = createAsyncThunk(
  `${REDUX_SLICE_NAMES.FOURNISSEURS}/delete`,
  async (fournisseurId, thunkAPI) => {
    try {
      await fournisseursService.deleteFournisseur(fournisseurId);
      return fournisseurId;
    } catch (error) {
      return thunkAPI.rejectWithValue(getErrorMessage(error));
    }
  }
);

// --- Slice ---
const initialState = {
  fournisseurs: [],
  fournisseurCourant: null,
  pagination: {},
  status: 'idle',
  message: '',
};

export const fournisseursSlice = createSlice({
  name: REDUX_SLICE_NAMES.FOURNISSEURS,
  initialState,
  reducers: {
    reset: (state) => {
      state.status = 'idle';
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFournisseurs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.fournisseurs = action.payload.data.fournisseurs;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFournisseurById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.fournisseurCourant = action.payload.fournisseur;
      })
      .addCase(updateFournisseur.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const updated = action.payload.fournisseur;
        state.fournisseurs = state.fournisseurs.map(f => (f._id === updated._id ? updated : f));
        if (state.fournisseurCourant?._id === updated._id) {
          state.fournisseurCourant = updated;
        }
      })
      .addCase(deleteFournisseur.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.fournisseurs = state.fournisseurs.filter(f => f._id !== action.payload);
      })
      .addCase(createFournisseur.fulfilled, (state) => {
        state.status = 'succeeded'; // On peut juste marquer le succès, la liste sera re-fetchée
      })
      // --- Matchers génériques ---
      .addMatcher(
        (action) => action.type.startsWith('fournisseurs/') && action.type.endsWith('/pending'),
        (state) => { state.status = 'loading'; }
      )
      .addMatcher(
        (action) => action.type.startsWith('fournisseurs/') && action.type.endsWith('/rejected'),
        (state, action) => { state.status = 'failed'; state.message = action.payload; }
      );
  },
});

export const { reset } = fournisseursSlice.actions;
export default fournisseursSlice.reducer;