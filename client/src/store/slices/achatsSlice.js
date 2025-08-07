// client/src/store/slices/achatsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import achatsService from '../../services/achatsService';
import { getErrorMessage } from '../../utils/helpers';
import { REDUX_SLICE_NAMES } from '../../utils/constants';

// --- Thunks ---
export const fetchFacturesAchat = createAsyncThunk(`${REDUX_SLICE_NAMES.ACHATS}/fetchAll`, async (p, t) => { try { return await achatsService.getAllFacturesAchat(p); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const fetchFactureAchatById = createAsyncThunk(`${REDUX_SLICE_NAMES.ACHATS}/fetchById`, async (id, t) => { try { return await achatsService.getFactureAchatById(id); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const createFactureAchat = createAsyncThunk(`${REDUX_SLICE_NAMES.ACHATS}/create`, async (data, t) => { try { return await achatsService.createFactureAchat(data); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const updateFactureAchat = createAsyncThunk(`${REDUX_SLICE_NAMES.ACHATS}/update`, async ({ id, data }, t) => { try { return await achatsService.updateFactureAchat(id, data); } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});
export const deleteFactureAchat = createAsyncThunk(`${REDUX_SLICE_NAMES.ACHATS}/delete`, async (id, t) => { try { await achatsService.deleteFactureAchat(id); return id; } catch (e) { return t.rejectWithValue(getErrorMessage(e)); }});

// --- Slice ---
const initialState = {
  facturesAchat: [], factureAchatCourante: null,
  pagination: {}, status: 'idle', message: '',
};

export const achatsSlice = createSlice({
  name: 'achats',
  initialState,
  reducers: {
    reset: (state) => { state.status = 'idle'; state.message = ''; state.factureAchatCourante = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacturesAchat.fulfilled, (state, action) => {
        state.facturesAchat = action.payload.data.facturesAchat;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchFactureAchatById.fulfilled, (state, action) => {
        state.factureAchatCourante = action.payload.factureAchat;
      })
      .addCase(createFactureAchat.fulfilled, (state, action) => {
        state.facturesAchat.unshift(action.payload.factureAchat);
      })
      .addCase(updateFactureAchat.fulfilled, (state, action) => {
        const updated = action.payload.factureAchat;
        state.facturesAchat = state.facturesAchat.map(f => f._id === updated._id ? updated : f);
      })
      .addCase(deleteFactureAchat.fulfilled, (state, action) => {
        state.facturesAchat = state.facturesAchat.filter(f => f._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type.startsWith(`${REDUX_SLICE_NAMES.ACHATS}/`) && action.type.endsWith('/pending'),
        (state) => { state.status = 'loading'; state.message = ''; }
      )
      .addMatcher(
        (action) => action.type.startsWith(`${REDUX_SLICE_NAMES.ACHATS}/`) && action.type.endsWith('/fulfilled'),
        (state) => { state.status = 'succeeded'; }
      )
      .addMatcher(
        (action) => action.type.startsWith(`${REDUX_SLICE_NAMES.ACHATS}/`) && action.type.endsWith('/rejected'),
        (state, action) => { state.status = 'failed'; state.message = action.payload; }
      );
  },
});

export const { reset } = achatsSlice.actions;
export default achatsSlice.reducer;